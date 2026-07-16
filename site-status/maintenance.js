/**
 * ==========================================
 * SITE MAINTENANCE & UPDATE NOTIFICATION SYSTEM
 * ==========================================
 */
(function () {
    // EDIT YOUR ICONS HERE:
    const maintenanceIcons = [
        "fa-solid fa-bug",
        "fa-solid fa-bug-slash",
        "fa-solid fa-wrench",
        "fa-solid fa-screwdriver",
        "fa-solid fa-screwdriver-wrench",
        "fa-solid fa-laptop-code"
    ];

    // Wait for the DOM to fully load
    window.addEventListener("DOMContentLoaded", () => {
        // Fallback checks in case the maintenance config file fails to load entirely
        const config = typeof maintenanceConfig !== "undefined" ? maintenanceConfig : {
            isUnderMaintenance: 1, 
            isCritical: 0,
            maintenanceType: "unknown",
            customSubtitle: "System details are currently unavailable.",
            currentTask: "Unknown Maintenance Task",
            customDetails: "Fetching optimization log details failed."
        };

        if (config.isUnderMaintenance !== 1) return;

        // Prevent background scrolling immediately
        document.body.style.overflow = "hidden";

        // 1. Fetch Game server status safely
        let serverStatusText = "Unknown Status";
        let statusClass = "status-unknown";
        let targetBuildRow = ""; 
        let detailsRow = "";
        
        // Notice block template for Closed OR Unknown data failures
        let serverNoticeHtml = `
            <div class="status-notice-block">
                Don't worry! As soon as COD Mobile opens the next public test server session, the active download links will <strong>immediately appear right here</strong> on this website.
            </div>
        `;

        const hasTestData = typeof testServerData !== "undefined";

        if (hasTestData) {
            if (testServerData.status === 1) {
                serverStatusText = "Open / Available";
                statusClass = "status-open";
                serverNoticeHtml = ""; // Wipe notice because links are hot!
            } else {
                serverStatusText = "Closed / Unavailable";
                statusClass = "status-closed";
            }
        }

        // Determine if the provided maintenance type string is a valid setting
        const isValidType = config.maintenanceType === "links" || config.maintenanceType === "site";

        // 🚨 USER-FRIENDLY VISITOR NOTICE BANNER
        let htmlAdminAlert = "";
        if (!hasTestData || !isValidType) {
            htmlAdminAlert = `
                <div class="status-notice-block" style="background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; border-left: 5px solid #ffc107; text-align: left; margin-bottom: 20px; padding: 14px 16px; border-radius: 6px; font-size: 0.9rem; line-height: 1.5;">
                    <strong style="color: #b55d00; display: block; margin-bottom: 4px;">
                        <i class="fa-solid fa-circle-exclamation"></i> Notice: Live Update Sync Offline
                    </strong>
                    Our real-time update system is currently experiencing a connection hiccup and couldn't display the latest patch notes automatically. 
                    <span style="display: block; margin-top: 6px; font-size: 0.85rem; opacity: 0.9;">
                        If you see this message, please <strong>let the website owner know</strong> (via YouTube comments or community channels) so it can be manually refreshed. Thank you for your help!
                    </span>
                </div>
            `;
        }

        // 2. Decide details to show based on "maintenanceType" and data availability
        if (config.maintenanceType === "links") {
            if (hasTestData) {
                targetBuildRow = `
                    <div class="info-row">
                        <span class="info-label">Target Build:</span>
                        <span class="info-value font-highlight">${testServerData.season || "Unknown Season"}</span>
                    </div>
                `;
                detailsRow = `
                    <div class="info-row">
                        <span class="info-label">Details:</span>
                        <span class="info-value">${testServerData.updateDescription || "System details are currently unavailable."}</span>
                    </div>
                `;
            } else {
                // DATA FAILED & TYPE IS LINKS
                targetBuildRow = `
                    <div class="info-row">
                        <span class="info-label">Target Build:</span>
                        <span class="info-value font-highlight">Unknown / Offline</span>
                    </div>
                `;
                detailsRow = ""; 
            }
        } else if (config.maintenanceType === "site") {
            // General site style maintenance block
            if (hasTestData) {
                detailsRow = `
                    <div class="info-row">
                        <span class="info-label">Update Info:</span>
                        <span class="info-value">${config.customDetails || "System details are currently unavailable."}</span>
                    </div>
                `;
            } else {
                detailsRow = "";
            }
        } else {
            // SECURITY FALLBACK: Handles typos, undefined, or missing types (e.g., "kol")
            targetBuildRow = `
                <div class="info-row">
                    <span class="info-label">Target Build:</span>
                    <span class="info-value font-highlight">Unknown / Offline</span>
                </div>
            `;
            detailsRow = ""; 
        }

        // 3. Dynamically handle the Proceed Anyway Button generation block
        let proceedButtonHtml = "";
        if (config.isCritical !== 1) {
            proceedButtonHtml = `
                <button id="closeMaintenanceBtn" class="btn-proceed-anyway">
                    Proceed Anyway <i class="fa-solid fa-arrow-right"></i>
                </button>
            `;
        }

        // 4. Set up explicit dynamic footnote text block based on systemic health states
        let footnoteText = "";
        if (!isValidType || !hasTestData) {
            footnoteText = "<strong>Notice:</strong> Connection sync parameter details are currently offline. Please notify the website administrator if this message persists.";
        } else if (testServerData.status === 1) {
            footnoteText = "The download links are officially <strong>OPEN</strong>! Please check back in a few minutes once our website adjustments are completed to grab your copy.";
        } else {
            footnoteText = "COD Mobile Public Test Server is currently <strong>CLOSED / UNAVAILABLE</strong> anyway, so you aren't missing out on active downloads while we work!";
        }

        // 5. Smart Dynamic UI title text and subtitle handling
        let mainTitleText = "Site Under Maintenance";
        let displaySubtitle = "";
        let displayTask = "";

        if (!isValidType && !hasTestData) {
            mainTitleText = "Temporary Sync Issue";
            displaySubtitle = "The website is undergoing upgrades, but its active information pipeline failed to sync up. Please reach out to the site owner.";
            displayTask = "Maintenance Panel Sync Failure";
        } else {
            displaySubtitle = hasTestData ? (config.customSubtitle || "We are currently deploying updates.") : "We are currently deploying updates. Server data connection is currently offline. Please notify the website owner if this takes too long.";
            displayTask = hasTestData ? (config.currentTask || "System Optimization Task") : "Unknown Maintenance Task";
        }

        // Build the full-screen overlay structure
        const maintenanceOverlay = document.createElement("div");
        maintenanceOverlay.id = "maintenanceOverlay";
        maintenanceOverlay.className = "maintenance-overlay";

        const initialIconClass = maintenanceIcons.length > 0 ? maintenanceIcons[0] : "fa-solid fa-screwdriver-wrench";

        maintenanceOverlay.innerHTML = `
            <div class="maintenance-card">
                <!-- User Notice Banner -->
                ${htmlAdminAlert}

                <!-- Dynamic Animated Icon Container -->
                <div class="maintenance-icon-wrapper">
                    <i id="maintenanceLiveIcon" class="${initialIconClass} icon-fade-element"></i>
                </div>
                
                <h1>${mainTitleText}</h1>
                <p class="maintenance-subtitle">${displaySubtitle}</p>

                <div class="maintenance-info-box">
                    <div class="info-row">
                        <span class="info-label">Current Task:</span>
                        <span class="info-value">${displayTask}</span>
                    </div>
                    ${targetBuildRow}
                    ${detailsRow}
                </div>

                <!-- Server Status Badge Container -->
                <div class="maintenance-status-badge-container">
                    <span class="status-badge-title">COD Mobile Test Server Status:</span>
                    <div class="status-badge ${statusClass}">
                        <span class="status-dot"></span>
                        <span class="status-text">${serverStatusText}</span>
                    </div>
                    ${serverNoticeHtml}
                </div>

                <div class="maintenance-yt-announcement">
                    <h3><i class="fa-brands fa-youtube"></i> Stay Updated on YouTube!</h3>
                    <p>
                        Don't miss a thing while we work! Head over to my channel for the latest COD Mobile leaks, gameplay previews, and instant updates on when the next test server build officially drops.
                    </p>
                    <a href="https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ" target="_blank" rel="noopener noreferrer" class="maintenance-yt-btn">
                        <i class="fa-brands fa-youtube"></i> Visit Vile Tempest Official
                    </a>
                </div>

                <!-- Footnote Info Block -->
                <p class="maintenance-footnote">
                    <i class="fa-solid fa-circle-info"></i>
                    ${footnoteText}
                </p>

                ${proceedButtonHtml}

                <div class="maintenance-footer">
                    <p>Thank you for your patience! We will be back online shortly.</p>
                    <span class="brand-subtext">
                        MOB EXTRA &bull; 
                        <a href="https://www.youtube.com/channel/UCbDtYZS08VvB6luAcyn08bQ" target="_blank" rel="noopener noreferrer" class="footer-creator-link">
                            Vile Tempest Official
                        </a>
                    </span>
                </div>
            </div>
        `;

        // Inject the overlay into the page body
        document.body.appendChild(maintenanceOverlay);

        // --- INFINITE ICON SWAPPING LOGIC ---
        const liveIconElement = document.getElementById("maintenanceLiveIcon");
        if (liveIconElement && maintenanceIcons.length > 1) {
            let currentIconIndex = 0;

            setInterval(() => {
                liveIconElement.classList.add("icon-hidden");

                setTimeout(() => {
                    liveIconElement.className = "icon-fade-element icon-hidden";
                    currentIconIndex = (currentIconIndex + 1) % maintenanceIcons.length;
                    
                    const classesToAdd = maintenanceIcons[currentIconIndex].split(" ");
                    classesToAdd.forEach(className => liveIconElement.classList.add(className));

                    setTimeout(() => {
                        liveIconElement.classList.remove("icon-hidden");
                    }, 20); 
                }, 250); 
            }, 2000); 
        }

        // Click Event listener logic to close the screen
        const closeBtn = document.getElementById("closeMaintenanceBtn");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                maintenanceOverlay.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                maintenanceOverlay.style.opacity = "0";
                maintenanceOverlay.style.transform = "scale(1.05)";
                
                setTimeout(() => {
                    maintenanceOverlay.remove();
                    document.body.style.overflow = ""; 
                }, 300);
            });
        }
    });
})();
