// OAuth2 Playground JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const grantTypeSelect = document.getElementById("grant-type")
  const baseUrlInput = document.getElementById("base-url")
  const tokenEndpointInput = document.getElementById("token-endpoint")
  const authorizationEndpointInput = document.getElementById("authorization-endpoint")
  const refreshTokenUrlInput = document.getElementById("refresh-token-url")
  const discoveryUrlInput = document.getElementById("discovery-url")
  const discoverBtn = document.getElementById("discover-btn")
  const codeVerifierInput = document.getElementById("code-verifier")
  const codeChallengeInput = document.getElementById("code-challenge")
  const challengeMethodSelect = document.getElementById("challenge-method")
  const generateVerifierBtn = document.getElementById("generate-verifier")
  const resultsContent = document.getElementById("results-content")

  let challengeTimeout

  // Tab switching functionality
  window.switchTab = (tab) => {
    const practiceTab = document.getElementById("practice-tab")
    const theoryTab = document.getElementById("theory-tab")
    const practiceContent = document.getElementById("practice-content")
    const theoryContent = document.getElementById("theory-content")

    if (tab === "practice") {
      practiceTab.classList.add("border-green-500", "text-green-600")
      practiceTab.classList.remove("border-transparent", "text-gray-500")
      theoryTab.classList.add("border-transparent", "text-gray-500")
      theoryTab.classList.remove("border-green-500", "text-green-600")
      practiceContent.classList.remove("hidden")
      theoryContent.classList.add("hidden")
    } else {
      theoryTab.classList.add("border-green-500", "text-green-600")
      theoryTab.classList.remove("border-transparent", "text-gray-500")
      practiceTab.classList.add("border-transparent", "text-gray-500")
      practiceTab.classList.remove("border-green-500", "text-green-600")
      theoryContent.classList.remove("hidden")
      practiceContent.classList.add("hidden")
    }
  }

  // Show/hide fields based on grant type
  grantTypeSelect.addEventListener("change", function () {
    document.querySelectorAll('[id^="fields-"]').forEach((group) => {
      group.classList.add("hidden")
    })

    if (this.value) {
      const selectedGroup = document.getElementById(`fields-${this.value}`)
      if (selectedGroup) {
        selectedGroup.classList.remove("hidden")
        selectedGroup.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  })

  // Auto-complete endpoints when base URL changes
  baseUrlInput.addEventListener("input", function () {
    const baseUrl = this.value.trim()
    if (baseUrl) {
      const authUrl = baseUrl.endsWith("/") ? baseUrl + "oauth2/authorize" : baseUrl + "/oauth2/authorize"
      authorizationEndpointInput.value = authUrl

      const tokenUrl = baseUrl.endsWith("/") ? baseUrl + "oauth2/token" : baseUrl + "/oauth2/token"
      tokenEndpointInput.value = tokenUrl

      // Also update refresh token URL
      if (refreshTokenUrlInput) {
        refreshTokenUrlInput.value = tokenUrl
      }

      // Auto-fill discovery URL
      discoveryUrlInput.value = baseUrl.endsWith("/")
          ? baseUrl + ".well-known/openid-configuration"
          : baseUrl + "/.well-known/openid-configuration"
    }
  })

  // Discovery endpoint functionality
  discoverBtn.addEventListener("click", async function () {
    const discoveryUrl = discoveryUrlInput.value.trim()
    if (!discoveryUrl) {
      showNotification("Please enter a discovery URL", "error")
      return
    }

    setButtonLoading(this, true)

    try {
      const response = await fetch(`/discover?url=${discoveryUrl}`, {
        method: "GET",
        headers: {
          "Accept": "application/json"
          // "X-CSRFToken": getCsrfToken(),
        }
      })

      const data = await response.json()

      if (data) {

        if (data.issuer) baseUrlInput.value = data.issuer
        if (data.token_endpoint) tokenEndpointInput.value = data.token_endpoint
        if (data.authorization_endpoint) authorizationEndpointInput.value = data.authorization_endpoint

        showNotification("Configuration loaded successfully!", "success")
        updateResults("Discovery", data)
      } else {
        showNotification(data.error || "Failed to load configuration", "error")
      }
    } catch (error) {
      showNotification("Network error: " + error.message, "error")
    } finally {
      setButtonLoading(this, false)
    }
  })

  // PKCE code challenge generation
  async function generateCodeChallenge() {
    const verifier = codeVerifierInput.value.trim()
    const method = challengeMethodSelect.value

    if (!verifier) {
      codeChallengeInput.value = ""
      return
    }

    if (method === "plain") {
      codeChallengeInput.value = verifier
    } else if (method === "S256") {
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(verifier)
        const digest = await crypto.subtle.digest("SHA-256", data)
        const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "")
        codeChallengeInput.value = challenge
      } catch (error) {
        const challenge = btoa(verifier).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
        codeChallengeInput.value = challenge
      }
    }
  }

  // Generate code challenge with 1-second delay
  codeVerifierInput.addEventListener("input", () => {
    clearTimeout(challengeTimeout)
    challengeTimeout = setTimeout(generateCodeChallenge, 1000)
  })

  challengeMethodSelect.addEventListener("change", generateCodeChallenge)

  // Generate random code verifier
  generateVerifierBtn.addEventListener("click", () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const verifier = btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
    codeVerifierInput.value = verifier
    generateCodeChallenge()
  })

  // Form submission
  document.getElementById("oauth2-form").addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const submitBtn = this.querySelector('button[type="submit"]')

    setButtonLoading(submitBtn, true)

    try {
      const response = await fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
      })

      const data = await response.json()
      updateResults("OAuth2 Flow", data)

      if (data.redirect_url) {
        window.open(data.redirect_url, "_blank")
      }
    } catch (error) {
      showNotification("Error: " + error.message, "error")
    } finally {
      setButtonLoading(submitBtn, false)
    }
  })

  // Utility functions
  function setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add("loading")
      button.disabled = true
    } else {
      button.classList.remove("loading")
      button.disabled = false
    }
  }

  function showNotification(message, type) {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
            <button onclick="this.parentElement.remove()" class="float-right text-lg">&times;</button>
            ${message}
        `

    document.querySelector(".max-w-7xl").prepend(notification)

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  function updateResults(title, data) {
    resultsContent.innerHTML = `
            <div class="text-left">
                <h3 class="text-lg font-semibold mb-4">${title} Results</h3>
                <pre class="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>
            </div>
        `
  }

  function getCsrfToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]")?.value || ""
  }
})
