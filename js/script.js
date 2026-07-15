// Global tracking variable for featured video players
let featuredPlayers = []; 

// 1. SINGLE Global entry point for the YouTube Iframe API
window.onYouTubeIframeAPIReady = function() {
    // Only initialize featured videos now
    initFeaturedPlayers();
};

// Dynamically load the official YouTube Iframe API script
(function() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

function loadLinks() {
    const container = document.getElementById("linksContainer");
    const lastUpdated = document.getElementById("lastUpdated");
    const badgeContainer = document.getElementById("buildBadgeContainer");

    try {
        if (typeof testServerData === "undefined") {
            throw new Error("Data not loaded");
        }

        // 1. Inject the Last Updated metadata date
        lastUpdated.innerHTML = `
            <i class="fa-solid fa-rocket"></i>
            Last Updated: <strong>${testServerData.lastUpdated}</strong>
        `;

        // 2. Inject the dynamic Season, Build Description, and Release Date below the title
        if (badgeContainer) {
            badgeContainer.innerHTML = `
                <div class="build-info-wrapper">
                    <div class="build-meta-row">
                        <span class="badge-season">${testServerData.season}</span>
                        <span class="badge-date"><i class="fa-regular fa-calendar"></i> ${testServerData.releaseDate}</span>
                    </div>
                    <p class="build-desc">${testServerData.updateDescription}</p>
                </div>
            `;
        }

        // 3. Render download card assets depending on open/closed availability state
        if (testServerData.status === 1) {
            container.innerHTML = "";

            testServerData.links.forEach((link, index) => {
                container.innerHTML += `
                    <div class="link-box">
                        <div class="link-title">${link.device}</div>
                        <div class="link" id="link${index}">${link.url}</div>
                        <button onclick="copyLink('link${index}', this)">
                             <i class="fa-regular fa-copy"></i> Copy Link
                        </button>
                    </div>
                `;
            });

            showVerification();
        } else {
            container.innerHTML = `
                <div class="server-closed">
                    <h2><i class="fa-solid fa-circle-exclamation"></i> Public Test Build Closed</h2>
                    <p>The Call of Duty: Mobile Public Test Build is currently unavailable.</p>
                    <p>Stay tuned for future updates from the official developers.</p>
                    
                    <div class="server-reassurance-note">
                        <i class="fa-solid fa-bell"></i>
                        <span>Don't worry! As soon as the developers launch the next Public Test Build session, the active download links will immediately appear right here on this website.</span>
                    </div>
                 </div>
            `;
        }
    } catch (error) {
        lastUpdated.innerHTML = `<i class="fa-solid fa-rocket"></i> Last Updated: <strong>Unavailable</strong>`;
        
        container.innerHTML = `
            <div class="load-error">
                <h2><i class="fa-solid fa-triangle-exclamation"></i> Unable to Load Download Links</h2>
                <p>The download link data could not be loaded at this time.</p>
                <p>Please refresh the page and try again. If the issue persists, the download link data may be temporarily unavailable.</p>
            </div>
        `;
        console.error(error);
    }
}

function copyLink(id, button) {
    const text = document.getElementById(id).innerText.trim();

    navigator.clipboard
        .writeText(text)
        .then(() => {
            const original = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-copy"></i> Copied!`;
            
            setTimeout(() => {
                button.innerHTML = original;
            }, 1500);
        })
        .catch(() => {
            alert("Unable to copy the link.");
        });
}

function showVerification() {
    if (typeof notARobot === "undefined") return;

    document.getElementById("videoSource").href = notARobot.codeSource;
    document.getElementById("verifyOverlay").style.display = "flex";
    
    // Reset checkbox state upon display panel invocation
    const checkbox = document.getElementById("disclaimerCheckbox");
    if (checkbox) checkbox.checked = false;
    
    updateButtonStatus();
}

function updateButtonStatus() {
    const unlockBtn = document.getElementById("unlockButton");
    const checkbox = document.getElementById("disclaimerCheckbox");
    if (!unlockBtn) return;

    if (checkbox && checkbox.checked) {
        unlockBtn.classList.remove("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Verify & Access Downloads`;
        unlockBtn.disabled = false;
    } else {
        unlockBtn.classList.add("btn-locked");
        unlockBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Accept Disclaimer Above`;
        unlockBtn.disabled = true;
    }
}

function unlockLinks() {
    const checkbox = document.getElementById("disclaimerCheckbox");
    const code = document.getElementById("verifyCode").value.trim();

    if (checkbox && !checkbox.checked) {
        alert("You must acknowledge and accept the disclaimer to access the downloads.");
        return;
    }

    if (code === "") {
        alert("Please enter the verification code.");
        return;
    }

    if (code !== notARobot.code) {
        alert("Incorrect verification code.");
        return;
    }

    document.getElementById("verifyOverlay").style.display = "none";
}

function waitForData() {
    const container = document.getElementById("linksContainer");
    let dots = 1;

    container.innerHTML = `
        <div class="loading-box">
            <div class="loader"></div>
            <p id="loadingText">Loading official download links.</p>
        </div>
    `;

    const loadingText = document.getElementById("loadingText");
    const loadingAnimation = setInterval(() => {
        loadingText.textContent = "Loading official download links" + ".".repeat(dots);
        dots++;
        
        if (dots > 3) {
            dots = 1;
        }
    }, 300);

    const startTime = Date.now();
    const checkData = setInterval(() => {
        if (typeof testServerData !== "undefined" && typeof notARobot !== "undefined") {
            clearInterval(checkData);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1000 - elapsed);

            setTimeout(() => {
                clearInterval(loadingAnimation);
                loadLinks();
            }, remaining);
        }
    }, 100);

    setTimeout(() => {
        if (typeof testServerData === "undefined" || typeof notARobot === "undefined") {
            clearInterval(checkData);
            clearInterval(loadingAnimation);
            loadLinks();
        }
    }, 3000);
}

function loadFeaturedVideos() {
    const section = document.getElementById("featuredVideosSection");

    if (typeof featuredVideos === "undefined" || featuredVideos.length === 0) {
        section.innerHTML = "";
        return;
    }

    let html = `
        <div class="featured-videos">
            <h2 class="section-title">Featured Content</h2>
    `;

    featuredVideos.forEach((video, index) => {
        const match = video.url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
        if (!match) return;

        const id = match[1];

        html += `
            <div class="video-card">
                <div class="video-title">${video.title}</div>
                <div class="video-container">
                    <div id="featuredPlayer_${index}" data-video-id="${id}"></div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    section.innerHTML = html;

    if (window.YT && window.YT.Player) {
        initFeaturedPlayers();
    }
}

function initFeaturedPlayers() {
    if (typeof featuredVideos === "undefined") return;
    if (featuredPlayers.length > 0) return;

    featuredVideos.forEach((video, index) => {
        const elementId = `featuredPlayer_${index}`;
        const targetElement = document.getElementById(elementId);
        if (!targetElement) return;

        const videoId = targetElement.getAttribute('data-video-id');

        const player = new YT.Player(elementId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'autoplay': 0,
                'rel': 0,
                'enablejsapi': 1,
                'origin': window.location.origin
            },
            events: {
                'onReady': function(e) {
                    const iframe = document.getElementById(elementId);
                    if (iframe) {
                        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    }
                }
            }
        });
        
        featuredPlayers.push(player);
    });
}

window.addEventListener("load", () => {
    waitForData();
    loadFeaturedVideos();

    const unlockBtn = document.getElementById("unlockButton");
    if (unlockBtn) {
        unlockBtn.addEventListener("click", unlockLinks);
    }
    
    const verifyCodeInput = document.getElementById("verifyCode");
    if (verifyCodeInput) {
        verifyCodeInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                unlockLinks();
            }
        });
    }

    const disclaimerBox = document.getElementById("disclaimerCheckbox");
    if (disclaimerBox) {
        disclaimerBox.addEventListener("change", updateButtonStatus);
    }

    const toggleBtn = document.getElementById("toggleIntroBtn");
    const drawer = document.getElementById("introContentDrawer");

    if (toggleBtn && drawer) {
        toggleBtn.addEventListener("click", () => {
            drawer.classList.toggle("expanded");
            toggleBtn.classList.toggle("active");

            const label = toggleBtn.querySelector("span");
            if (drawer.classList.contains("expanded")) {
                label.textContent = "Show Less";
            } else {
                label.textContent = "Read More";
            }
        });
    }

    const shareBtn = document.getElementById("shareSiteBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            let shareTitle = 'CODM Test Server Download Links | MOB EXTRA';
            let shareText = 'Get instant access to the latest official Call of Duty: Mobile Test Server download links!\n\n';

            if (typeof testServerData !== "undefined") {
                shareTitle = `CODM Test Server - ${testServerData.season} Hub | MOB EXTRA`;
                shareText = `Get instant access to the latest ${testServerData.season} build (${testServerData.updateDescription})!\n\n`;
            }

            const shareData = {
                title: shareTitle,
                text: shareText,
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(shareData)
                    .catch((err) => console.log('Error sharing:', err));
            } else {
                navigator.clipboard.writeText(`${shareText}${window.location.href}`)
                    .then(() => {
                        const originalText = shareBtn.innerHTML;
                        shareBtn.innerHTML = `<i class="fa-solid fa-check"></i> Link Copied!`;
                        setTimeout(() => { shareBtn.innerHTML = originalText; }, 2000);
                    })
                    .catch(() => {
                        alert("Could not copy link automatically. Please copy the URL from your address bar!");
                    });
            }
        });
    }
});
