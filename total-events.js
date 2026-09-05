const SUPABASE_URL = 'https://zftjzlootkvnquwiwsic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Olfff104V9bCod1UkTbwyA_VgMLB3IE';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function toggleTheme() {
    document.body.classList.toggle("light-mode");

    const icon = document.querySelector(".theme-toggle i");
    const isLight = document.body.classList.contains("light-mode");

    icon.className = isLight ? "fas fa-sun" : "fas fa-moon";
    localStorage.setItem("theme", isLight ? "light" : "dark");
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getSafeUrl(value) {
    const url = String(value || "").trim();

    if (!url) return "";

    try {
        const parsedUrl = new URL(url);

        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return "";
        }

        return escapeHTML(parsedUrl.href);
    } catch {
        return "";
    }
}

async function fetchAllEvents() {
    const { data, error } = await _supabase
        .from("events")
        .select("*")
        .order("event_start_time", { ascending: false });

    if (error) {
        console.error("Error fetching events:", error);
        document.getElementById("eventsGrid").innerHTML = `
            <div class="card">
                <h2>Error loading events</h2>
            </div>
        `;
        return;
    }

    const filter = new URLSearchParams(window.location.search).get("filter");
    let filteredEvents = data || [];

    if (filter === "broadcasted") {
        filteredEvents = filteredEvents.filter(event =>
            event.event_status === "Broadcasted"
        );
    } else if (filter === "unbroadcasted") {
        filteredEvents = filteredEvents.filter(event =>
            event.event_status === "Unbroadcasted"
        );
    } else if (filter === "upcoming") {
        const now = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);

        filteredEvents = filteredEvents.filter(event => {
            if (!event.event_start_time) return false;

            const eventDate = new Date(event.event_start_time);
            return eventDate >= now && eventDate <= threeDaysLater;
        });
    }

    displayEvents(filteredEvents);
}

function displayEvents(events) {
    const grid = document.getElementById("eventsGrid");

    if (!events.length) {
        grid.innerHTML = `
            <div class="card">
                <h2>No events found.</h2>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";

    events.forEach(event => {
        const card = document.createElement("div");
        card.className = "card";
        card.title = event.event_name || "View event details";
        card.setAttribute(
            "aria-label",
            `View ${event.event_name || "event"} details`
        );

        const imageUrl = event.event_image_url ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmM8P5uvVCt-8ZlBmd2qmlJK-C7RpM07uW06KF_uMeKA&s=10";

        card.style.backgroundImage = `url('${imageUrl.replace(/'/g, "%27")}')`;
        card.style.cursor = "pointer";

        const safeEventUrl = getSafeUrl(event.event_url);

        card.innerHTML = `
            <div style="
                position: absolute;
                inset: 0;
                z-index: 2;
                display: flex;
                align-items: flex-end;
                padding: 1.2rem;
                background: linear-gradient(
                    to top,
                    rgba(0, 0, 0, 0.95),
                    rgba(0, 0, 0, 0.25) 75%,
                    transparent
                );
                pointer-events: none;
            ">
                <div style="
                    width: 100%;
                    color: #ffffff;
                    text-shadow: 0 2px 5px rgba(0,0,0,0.8);
                ">
                    <div style="
                        font-size: 1.1rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                    ">
                        ${escapeHTML(event.event_name || "N/A")}
                    </div>

                    <div style="font-size: 0.85rem; margin-top: 0.25rem;">
                        <strong>Venue:</strong>
                        ${escapeHTML(event.venue_name || "N/A")}
                    </div>

                    <div style="font-size: 0.85rem; margin-top: 0.25rem;">
                        <strong>Mapping ID:</strong>
                        ${escapeHTML(event.event_mapping_id || "N/A")}
                    </div>

                    <div style="font-size: 0.85rem; margin-top: 0.25rem;">
                        <strong>Event Link:</strong>
                        ${
                            safeEventUrl
                                ? `
                                    <a
                                        href="${safeEventUrl}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style="
                                            color: #58a6ff;
                                            text-decoration: underline;
                                            pointer-events: auto;
                                            word-break: break-all;
                                        "
                                        onclick="event.stopPropagation()"
                                    >
                                        Open Link
                                    </a>
                                `
                                : "N/A"
                        }
                    </div>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            window.location.href =
                `event-details.html?id=${encodeURIComponent(event.id)}`;
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

    document.querySelectorAll("#eventsGrid .card").forEach(card => {
        card.style.display = card.title.toLowerCase().includes(searchTerm)
            ? "flex"
            : "none";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        document.querySelector(".theme-toggle i").className = "fas fa-sun";
    }

    const filter = new URLSearchParams(window.location.search).get("filter");
    const titleEl = document.querySelector(".dashboard-title h1");

    const titles = {
        all: "ALL EVENTS",
        broadcasted: "BROADCASTED EVENTS",
        unbroadcasted: "UNBROADCASTED EVENTS",
        upcoming: "UPCOMING EVENTS (3 Days)"
    };

    if (titleEl) {
        titleEl.textContent = titles[filter] || "ALL EVENTS";
    }

    document
        .getElementById("searchInput")
        .addEventListener("input", searchCards);

    document
        .getElementById("searchBtn")
        .addEventListener("click", searchCards);

    fetchAllEvents();
});
