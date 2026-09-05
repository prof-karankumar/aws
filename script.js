const SUPABASE_URL = 'https://zftjzlootkvnquwiwsic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Olfff104V9bCod1UkTbwyA_VgMLB3IE';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dashboardData = {
    totalAll: 0,
    totalBroadcasted: 0,
    totalUnbroadcasted: 0,
    upcoming: 0
};

const LOGIN_USERNAME = "karan";
const LOGIN_PASSWORD = "kumar";

let isLoggedIn = false;

// Check saved login state on page load
function checkSavedLogin() {
    const savedLogin = localStorage.getItem("isLoggedIn");
    if (savedLogin === "true") {
        isLoggedIn = true;
        document.getElementById("loginBtn").textContent = "Logout";
        document.getElementById("loginModal").style.display = "none";
        return true;
    }
    return false;
}

function toggleTheme() {
    const body = document.body;
    const toggleIcon = document.querySelector(".theme-toggle i");

    body.classList.toggle("light-mode");

    if (body.classList.contains("light-mode")) {
        toggleIcon.className = "fas fa-sun";
        localStorage.setItem("theme", "light");
    } else {
        toggleIcon.className = "fas fa-moon";
        localStorage.setItem("theme", "dark");
    }
}

// Supabase se data fetch karke dashboard update karne ka function
async function fetchAndCalculateDashboard() {
    const { data, error } = await _supabase.from('events').select('*');

    if (error) {
        console.error("Error fetching events from Supabase:", error.message);
        return;
    }

    // Total Active Events card = tamam (total) events, chahe status koi bhi ho
    dashboardData.totalAll = data.length;
    dashboardData.totalBroadcasted = data.filter(e => e.event_status === 'Broadcasted').length;
    dashboardData.totalUnbroadcasted = data.filter(e => e.event_status === 'Unbroadcasted').length;
    
    // Upcoming calculation (next 3 days)
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    dashboardData.upcoming = data.filter(e => {
        if (!e.event_start_time) return false;
        const eventDate = new Date(e.event_start_time);
        return eventDate >= now && eventDate <= threeDaysLater;
    }).length;

    updateDashboardUI();
}

function updateDashboardUI() {
    const titles = [
        `Total Active Events: ${dashboardData.totalAll}`,
        `Total Broadcasted: ${dashboardData.totalBroadcasted}`,
        `Total Unbroadcasted: ${dashboardData.totalUnbroadcasted}`,
        `Upcoming (3 Days): ${dashboardData.upcoming}`
    ];

    const numbers = [
        dashboardData.totalAll,
        dashboardData.totalBroadcasted,
        dashboardData.totalUnbroadcasted,
        dashboardData.upcoming
    ];

    document.querySelectorAll(".card h2").forEach((card, index) => {
        card.innerHTML = `${titles[index].split(":")[0]}:
            <span style="font-size:1.4rem;display:block;margin-top:4px;color:#FFFFFF;">
                ${numbers[index]}
            </span>`;
    });
}

function loginUser() {
    isLoggedIn = true;
    localStorage.setItem("isLoggedIn", "true");

    document.getElementById("loginModal").style.display = "none";
    document.getElementById("loginBtn").textContent = "Logout";

    fetchAndCalculateDashboard();
}

function logoutUser() {
    isLoggedIn = false;
    localStorage.setItem("isLoggedIn", "false");

    document.getElementById("loginBtn").textContent = "Login";
    document.getElementById("eventModal").style.display = "none";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    // Refresh dashboard with 0 values since user is logged out
    dashboardData.totalAll = 0;
    dashboardData.totalBroadcasted = 0;
    dashboardData.totalUnbroadcasted = 0;
    dashboardData.upcoming = 0;
    updateDashboardUI();
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        document.querySelector(".theme-toggle i").className = "fas fa-sun";
    }

    // Check if user was previously logged in
    checkSavedLogin();

    // If not logged in, show login modal automatically
    if (!isLoggedIn) {
        document.getElementById("loginModal").style.display = "flex";
    }

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
            loginError.style.display = "none";
            loginUser();
        } else {
            loginError.style.display = "block";
        }
    });

    loginBtn.addEventListener("click", event => {
        event.preventDefault();

        if (isLoggedIn) {
            logoutUser();
        } else {
            document.getElementById("loginModal").style.display = "flex";
        }
    });

    // Make dashboard cards clickable - each card goes to its filtered view
    document.querySelectorAll(".card").forEach((card, index) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const filterMap = ["all", "broadcasted", "unbroadcasted", "upcoming"];
            window.location.href = `total-events.html?filter=${filterMap[index]}`;
        });
    });

    const eventModal = document.getElementById("eventModal");
    const addEventNavBtn = document.getElementById("addEventNavBtn");
    const closeModalBtn = document.getElementById("closeModal");
    const eventForm = document.getElementById("eventForm");

    addEventNavBtn.addEventListener("click", event => {
        event.preventDefault();

        if (!isLoggedIn) {
            alert("Please login first.");
            return;
        }

        eventModal.style.display = "flex";
    });

    closeModalBtn.addEventListener("click", () => {
        eventModal.style.display = "none";
    });

    window.addEventListener("click", event => {
        if (event.target === eventModal) {
            eventModal.style.display = "none";
        }
    });

    // Form submission to Supabase Database
    eventForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (!isLoggedIn) {
            alert("Please login first.");
            return;
        }

        const eventName = document.getElementById("eventName").value;
        const eventMappingID = document.getElementById("eventMappingID").value;
        const venueName = document.getElementById("venueName").value;
        const eventID = document.getElementById("eventID").value;
        const eventStartTime = document.getElementById("eventStartTime").value;
        const transferDate = document.getElementById("transferDate").value;
        const listCost = document.getElementById("listCost").value;
        const eventStatus = document.getElementById("eventStatus").value;
        const eventURL = document.getElementById("eventURL").value;
        const eventimageURL = document.getElementById("eventimageURL").value;

        // Supabase me insert karne ka object
        const newEventData = {
            event_name: eventName,
            event_mapping_id: eventMappingID,
            venue_name: venueName,
            event_id: eventID,
            event_start_time: eventStartTime,
            transfer_date: transferDate,
            list_cost_percentage: parseFloat(listCost),
            event_status: eventStatus,
            event_url: eventURL,
            event_image_url: eventimageURL
        };

        const { data, error } = await _supabase
            .from('events')
            .insert([newEventData]);

        if (error) {
            console.error("Error saving event:", error.message);
            alert("Failed to save event to database: " + error.message);
            return;
        }

        // Refresh dashboard numbers from Supabase
        await fetchAndCalculateDashboard();
        
        eventForm.reset();
        eventModal.style.display = "none";

        alert(`Success! Event "${eventName}" has been added and saved to Supabase.`);
    });

    // Home link - just stay on page, no logout
    const homeLink = document.querySelector('a[href="#"].protected-link');
    if (homeLink) {
        homeLink.addEventListener("click", event => {
            event.preventDefault();
            // Home is already the current page, do nothing
        });
    }

    // Use visibilitychange event to refresh data when coming back to tab
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isLoggedIn) {
            fetchAndCalculateDashboard();
        }
    });

    // Also refresh on focus
    window.addEventListener('focus', () => {
        if (isLoggedIn) {
            fetchAndCalculateDashboard();
        }
    });

    // Initial fetch only if logged in
    if (isLoggedIn) {
        fetchAndCalculateDashboard();
    }
});
