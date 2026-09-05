const SUPABASE_URL = 'https://zftjzlootkvnquwiwsic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Olfff104V9bCod1UkTbwyA_VgMLB3IE';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOGIN_USERNAME = "karan";
const LOGIN_PASSWORD = "kumar";

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

async function fetchAllEvents() {
    const { data, error } = await _supabase.from('events').select('*').order('event_start_time', { ascending: false });

    if (error) {
        console.error("Error fetching events:", error.message);
        document.getElementById("eventsGrid").innerHTML = `<div class="card"><h2>Error loading events</h2></div>`;
        return;
    }

    // Get filter from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');

    let filteredEvents = data;

    if (filter === "all") {
        // "Total Active Events" card = total mila ke tamam events, chahe status koi bhi ho
        filteredEvents = data;
    } else if (filter === "broadcasted") {
        filteredEvents = data.filter(e => e.event_status === 'Broadcasted');
    } else if (filter === "unbroadcasted") {
        filteredEvents = data.filter(e => e.event_status === 'Unbroadcasted');
    } else if (filter === "upcoming") {
        const now = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);
        filteredEvents = data.filter(e => {
            if (!e.event_start_time) return false;
            const eventDate = new Date(e.event_start_time);
            return eventDate >= now && eventDate <= threeDaysLater;
        });
    }

    displayEvents(filteredEvents);
}

function displayEvents(events) {
    const grid = document.getElementById("eventsGrid");

    if (!events || events.length === 0) {
        grid.innerHTML = `<div class="card"><h2>No events found. Add events from Home page!</h2></div>`;
        return;
    }

    grid.innerHTML = "";

    events.forEach(event => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.backgroundImage = `url('${event.event_image_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmM8P5uvVCt-8ZlBmd2qmlJK-C7RpM07uW06KF_uMeKA&s=10"}')`;

        const statusColor = event.event_status === "Active" ? "#4CAF50" : 
                           event.event_status === "Broadcasted" ? "#026CDF" : "#FF9800";

        // Click on card to go to event details page
        card.style.cursor = "pointer";

        card.innerHTML = `
            <div style="position: relative; z-index: 2; width: 100%;">
                <h2 style="margin-bottom: 0.5rem; font-size: 1rem; text-align: left; background: rgba(0,0,0,0.6);">
                    <span style="font-size: 1.2rem; display: block; margin-bottom: 2px;">${event.event_name || "Unknown Event"}</span>
                    <span style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">Venue: ${event.venue_name || "N/A"}</span>
                </h2>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                    <span style="background: ${statusColor}; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; color: white; font-weight: 600;">
                        ${event.event_status}
                    </span>
                    <button onclick="event.stopPropagation(); window.location.href='event-details.html?id=${event.id}'" style="background: #026CDF; border: none; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
                ${event.event_url ? `<a href="${event.event_url}" target="_blank" style="display: block; margin-top: 0.5rem; color: #026CDF; font-size: 0.75rem; text-align: center; background: rgba(0,0,0,0.4); padding: 0.3rem; border-radius: 10px;"><i class="fas fa-external-link-alt"></i> Event Link</a>` : ""}
            </div>
        `;

        // Click on card goes to details page
        card.addEventListener("click", () => {
            window.location.href = `event-details.html?id=${event.id}`;
        });

        grid.appendChild(card);
    });
}

function searchCards() {
    const searchTerm = document
        .getElementById("searchInput")
        .value
        .trim()
        .toLowerCase();

    document.querySelectorAll(".card").forEach(card => {
        const cardText = card.textContent.toLowerCase();
        card.style.display = cardText.includes(searchTerm) ? "flex" : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        document.querySelector(".theme-toggle i").className = "fas fa-sun";
    }

    // Update page title based on filter
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');
    const titleEl = document.querySelector(".dashboard-title h1");
    if (titleEl) {
        const titles = {
            "all": "ALL EVENTS",
            "broadcasted": "BROADCASTED EVENTS",
            "unbroadcasted": "UNBROADCASTED EVENTS",
            "upcoming": "UPCOMING EVENTS (3 Days)"
        };
        if (filter && titles[filter]) {
            titleEl.textContent = titles[filter];
        } else {
            titleEl.textContent = "ALL EVENTS";
        }
    }

    // Search functionality (ab home se hata kar yahan is page par kar diya)
    document.getElementById("searchInput").addEventListener("input", searchCards);
    document.getElementById("searchBtn").addEventListener("click", searchCards);

    fetchAllEvents();
});
