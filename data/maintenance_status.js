/**
 * ==========================================
 * LIVE SITE MAINTENANCE CONFIGURATION
 * ==========================================
 */
const maintenanceConfig = {
    // 1 = Active (Show maintenance window) | 0 = Inactive (Normal site)
    isUnderMaintenance: 0,

    // 1 = Critical (Hides the 'Proceed Anyway' button entirely)
    // 0 = Optional (Displays the button so users can look at the UI anyway)
    isCritical: 0,

    // Define the type of maintenance work:
    // "site"  -> If you are only updating UI, styles, or page layouts (Hides target build stats)
    // "links" -> If you are preparing or updating the CODM download links (Displays target build stats)
    maintenanceType: "site", 

    // Custom text to show on the maintenance screen
    customSubtitle: "We are currently deploying new feature updates, structural modifications, and user interface enhancements.",
    currentTask: "Integrating New Features & UI Enhancements",
    customDetails: "Adding fresh site functionality, optimizing general mobile responsiveness, and updating brand assets for a smoother experience."
};
