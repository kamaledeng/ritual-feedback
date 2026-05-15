const ritualChain = {
  chainId: "0x7BB",
  chainName: "Ritual Testnet",
  nativeCurrency: {
    name: "RITUAL",
    symbol: "RITUAL",
    decimals: 18
  },
  rpcUrls: ["https://rpc.ritualfoundation.org"],
  blockExplorerUrls: ["https://explorer.ritualfoundation.org"]
};

const sampleFeedback = [
  {
    category: "Developer docs",
    urgency: "High",
    builderType: "Agent builder",
    title: "Add a one-page async lifecycle cookbook",
    message: "A visual recipe for one pending async job per EOA would help builders avoid failed submissions and design better UI states.",
    address: "0xRitual...demo",
    createdAt: "Demo"
  },
  {
    category: "Wallet flow",
    urgency: "Medium",
    builderType: "dApp founder",
    title: "Expose RitualWallet balance examples",
    message: "A small frontend snippet for depositing, locking, and reading balances would make first integration smoother.",
    address: "0xBuilder...demo",
    createdAt: "Demo"
  },
  {
    category: "Ecosystem",
    urgency: "Low",
    builderType: "Community",
    title: "Create a public showcase for agent apps",
    message: "A curated gallery would help new users understand what autonomous intelligence looks like in production.",
    address: "0xSignal...demo",
    createdAt: "Demo"
  }
];

let walletAddress = "";

const elements = {
  connectWallet: document.querySelector("#connectWallet"),
  walletLabel: document.querySelector("#walletLabel"),
  switchRitual: document.querySelector("#switchRitual"),
  networkStatus: document.querySelector("#networkStatus"),
  formStatus: document.querySelector("#formStatus"),
  feedbackForm: document.querySelector("#feedbackForm"),
  feedbackBoard: document.querySelector("#feedbackBoard"),
  canvas: document.querySelector("#field")
};

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getProvider() {
  return window.ethereum;
}

async function connectWallet() {
  const provider = getProvider();
  if (!provider) {
    elements.formStatus.textContent = "Install MetaMask or another EIP-1193 wallet first.";
    return;
  }

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  walletAddress = accounts[0] || "";
  if (walletAddress) {
    elements.connectWallet.classList.add("connected");
    elements.walletLabel.textContent = shortAddress(walletAddress);
    elements.formStatus.textContent = "Wallet connected. Your feedback can now be signed.";
    await refreshNetwork();
  }
}

async function refreshNetwork() {
  const provider = getProvider();
  if (!provider) {
    elements.networkStatus.textContent = "No wallet detected";
    return;
  }

  const chainId = await provider.request({ method: "eth_chainId" });
  elements.networkStatus.textContent = chainId.toLowerCase() === ritualChain.chainId.toLowerCase()
    ? "Connected to Ritual"
    : `Connected to ${parseInt(chainId, 16)}`;
}

async function switchToRitual() {
  const provider = getProvider();
  if (!provider) {
    elements.formStatus.textContent = "Wallet not found. Install a browser wallet first.";
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ritualChain.chainId }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [ritualChain]
      });
    } else {
      throw error;
    }
  }

  await refreshNetwork();
}

function loadFeedback() {
  const stored = JSON.parse(localStorage.getItem("ritual-feedback") || "[]");
  return [...stored, ...sampleFeedback];
}

function saveFeedback(item) {
  const stored = JSON.parse(localStorage.getItem("ritual-feedback") || "[]");
  localStorage.setItem("ritual-feedback", JSON.stringify([item, ...stored].slice(0, 12)));
}

function renderFeedback() {
  const feedback = loadFeedback();
  elements.feedbackBoard.innerHTML = feedback.map((item) => `
    <article>
      <small>${item.category} · ${item.createdAt}</small>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.message)}</p>
      <div class="tag-row">
        <span>${item.urgency}</span>
        <span>${item.builderType}</span>
        <span>${item.address}</span>
      </div>
    </article>
  `).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function submitFeedback(event) {
  event.preventDefault();

  if (!walletAddress) {
    await connectWallet();
  }

  if (!walletAddress) return;

  const payload = {
    category: document.querySelector("#category").value,
    urgency: document.querySelector("#urgency").value,
    builderType: document.querySelector("#builderType").value,
    title: document.querySelector("#title").value.trim(),
    message: document.querySelector("#message").value.trim(),
    address: shortAddress(walletAddress),
    createdAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })
  };

  const signatureMessage = [
    "Ritual Feedback",
    `Address: ${walletAddress}`,
    `Category: ${payload.category}`,
    `Urgency: ${payload.urgency}`,
    `Title: ${payload.title}`,
    `Message: ${payload.message}`
  ].join("\n");

  try {
    const signature = await getProvider().request({
      method: "personal_sign",
      params: [signatureMessage, walletAddress]
    });

    saveFeedback({ ...payload, signature: `${signature.slice(0, 10)}...${signature.slice(-8)}` });
    elements.feedbackForm.reset();
    elements.formStatus.textContent = "Signed feedback added to your local board.";
    renderFeedback();
  } catch {
    elements.formStatus.textContent = "Signature rejected. Feedback was not submitted.";
  }
}

function bootCanvas() {
  const canvas = elements.canvas;
  const ctx = canvas.getContext("2d");
  const points = Array.from({ length: 72 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0007,
    vy: (Math.random() - 0.5) * 0.0007,
    radius: 1 + Math.random() * 2
  }));

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    ctx.clearRect(0, 0, width, height);

    for (const point of points) {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > 1) point.vx *= -1;
      if (point.y < 0 || point.y > 1) point.vy *= -1;

      const x = point.x * width;
      const y = point.y * height;
      ctx.beginPath();
      ctx.arc(x, y, point.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 193, 93, 0.58)";
      ctx.fill();
    }

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dx = (a.x - b.x) * width;
        const dy = (a.y - b.y) * height;
        const distance = Math.hypot(dx, dy);
        if (distance < 145) {
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.strokeStyle = `rgba(124, 231, 184, ${0.12 * (1 - distance / 145)})`;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

elements.connectWallet.addEventListener("click", connectWallet);
elements.switchRitual.addEventListener("click", async () => {
  try {
    await switchToRitual();
    elements.formStatus.textContent = "Ritual network is ready in your wallet.";
  } catch {
    elements.formStatus.textContent = "Could not switch network. Check wallet permissions.";
  }
});
elements.feedbackForm.addEventListener("submit", submitFeedback);

if (getProvider()) {
  getProvider().on?.("chainChanged", refreshNetwork);
  getProvider().on?.("accountsChanged", (accounts) => {
    walletAddress = accounts[0] || "";
    if (walletAddress) {
      elements.connectWallet.classList.add("connected");
      elements.walletLabel.textContent = shortAddress(walletAddress);
    } else {
      elements.connectWallet.classList.remove("connected");
      elements.walletLabel.textContent = "Connect wallet";
    }
  });
  refreshNetwork();
}

renderFeedback();
bootCanvas();
