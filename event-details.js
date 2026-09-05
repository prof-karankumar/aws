const SUPABASE_URL = 'https://zftjzlootkvnquwiwsic.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Olfff104V9bCod1UkTbwyA_VgMLB3IE';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentEvent = null;

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

async function loadEventDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        document.getElementById("eventContent").innerHTML = `<p style="color: var(--subtext-color);">No event ID provided. <a href="total-events.html" style="color: #026CDF;">Go back</a></p>`;
        return;
    }

    const { data, error } = await _supabase.from('events').select('*').eq('id', eventId).single();

    if (error || !data) {
        document.getElementById("eventContent").innerHTML = `<p style="color: var(--subtext-color);">Event not found. <a href="total-events.html" style="color: #026CDF;">Go back</a></p>`;
        return;
    }

    currentEvent = data;
    renderEventDetails(data);
}

function renderEventDetails(event) {
    const container = document.getElementById("eventContent");

    const statusColor = event.event_status === "Active" ? "#4CAF50" : 
                       event.event_status === "Broadcasted" ? "#026CDF" : "#FF9800";

    const eventDate = event.event_start_time ? new Date(event.event_start_time).toLocaleString() : "N/A";
    const transferDate = event.transfer_date ? new Date(event.transfer_date).toLocaleDateString() : "N/A";

    container.innerHTML = `
        <!-- Hero Image -->
        <div class="event-hero" style="background-image: url('${event.event_image_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmM8P5uvVCt-8ZlBmd2qmlJK-C7RpM07uW06KF_uMeKA&s=10"}')">
            <div class="event-hero-content">
                <h1>${event.event_name || "Unknown Event"}</h1>
                <span class="status-badge" style="background: ${statusColor};">${event.event_status}</span>
            </div>
        </div>

        <!-- Event Info -->
        <div class="event-info-card">
            <h3><i class="fas fa-info-circle"></i> Event Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Event Name</span>
                    <span class="value">${event.event_name || "N/A"}</span>
                </div>
                <div class="info-item">
                    <span class="label">Venue</span>
                    <span class="value">${event.venue_name || "N/A"}</span>
                </div>
                <div class="info-item">
                    <span class="label">Event Date & Time</span>
                    <span class="value">${eventDate}</span>
                </div>
                <div class="info-item">
                    <span class="label">Mapping ID</span>
                    <span class="value">${event.event_mapping_id || "N/A"}</span>
                </div>
                <div class="info-item">
                    <span class="label">Event ID</span>
                    <span class="value">${event.event_id || "N/A"}</span>
                </div>
                <div class="info-item">
                    <span class="label">Transfer Date</span>
                    <span class="value">${transferDate}</span>
                </div>
                <div class="info-item">
                    <span class="label">List Cost %</span>
                    <span class="value">${event.list_cost_percentage || 0}%</span>
                </div>
                <div class="info-item">
                    <span class="label">Status</span>
                    <span class="value" style="color: ${statusColor}; font-weight: 600;">${event.event_status}</span>
                </div>
            </div>
            
            ${event.event_url ? `
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--card-border);">
                <span class="label">Event URL</span>
                <a href="${event.event_url}" target="_blank" style="display: block; color: #026CDF; margin-top: 0.3rem; word-break: break-all;">
                    <i class="fas fa-external-link-alt"></i> ${event.event_url}
                </a>
            </div>
            ` : ""}
        </div>

        <!-- Actions -->
        <div class="event-info-card">
            <h3><i class="fas fa-cog"></i> Event Actions</h3>
            <div class="action-buttons">
                <button class="action-btn active-btn" onclick="updateStatus('Active')">
                    <i class="fas fa-play"></i> Active
                </button>
                <button class="action-btn broadcast-btn" onclick="updateStatus('Broadcasted')">
                    <i class="fas fa-broadcast-tower"></i> Broadcast
                </button>
                <button class="action-btn stop-btn" onclick="updateStatus('Unbroadcasted')">
                    <i class="fas fa-stop"></i> Stop Broadcast
                </button>
                <button class="action-btn edit-btn" onclick="openEditModal()">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteEvent()">
                    <i class="fas fa-trash"></i> Delete Event
                </button>
            </div>
        </div>
    `;
}

async function updateStatus(newStatus) {
    if (!currentEvent) return;

    const { error } = await _supabase
        .from('events')
        .update({ event_status: newStatus })
        .eq('id', currentEvent.id);

    if (error) {
        alert("Failed to update status: " + error.message);
        return;
    }

    currentEvent.event_status = newStatus;
    renderEventDetails(currentEvent);
}

async function deleteEvent() {
    if (!currentEvent) return;

    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) {
        return;
    }

    const { error } = await _supabase
        .from('events')
        .delete()
        .eq('id', currentEvent.id);

    if (error) {
        alert("Failed to delete event: " + error.message);
        return;
    }

    alert("Event deleted successfully!");
    window.location.href = "total-events.html";
}

function openEditModal() {
    if (!currentEvent) return;

    document.getElementById("editEventName").value = currentEvent.event_name || "";
    document.getElementById("editEventMappingID").value = currentEvent.event_mapping_id || "";
    document.getElementById("editVenueName").value = currentEvent.venue_name || "";
    document.getElementById("editEventID").value = currentEvent.event_id || "";
    
    // Format datetime-local value
    if (currentEvent.event_start_time) {
        const d = new Date(currentEvent.event_start_time);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById("editEventStartTime").value = local;
    }
    
    document.getElementById("editTransferDate").value = currentEvent.transfer_date ? currentEvent.transfer_date.slice(0, 10) : "";
    document.getElementById("editListCost").value = currentEvent.list_cost_percentage || "";
    document.getElementById("editEventStatus").value = currentEvent.event_status || "Active";
    document.getElementById("editEventURL").value = currentEvent.event_url || "";
    document.getElementById("editEventImageURL").value = currentEvent.event_image_url || "";

    document.getElementById("editModal").style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        document.querySelector(".theme-toggle i").className = "fas fa-sun";
    }

    loadEventDetails();

    // Edit form submission
    document.getElementById("editForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!currentEvent) return;

        const updatedData = {
            event_name: document.getElementById("editEventName").value,
            event_mapping_id: document.getElementById("editEventMappingID").value,
            venue_name: document.getElementById("editVenueName").value,
            event_id: document.getElementById("editEventID").value,
            event_start_time: document.getElementById("editEventStartTime").value,
            transfer_date: document.getElementById("editTransferDate").value,
            list_cost_percentage: parseFloat(document.getElementById("editListCost").value),
            event_status: document.getElementById("editEventStatus").value,
            event_url: document.getElementById("editEventURL").value,
            event_image_url: document.getElementById("editEventImageURL").value
        };

        const { error } = await _supabase
            .from('events')
            .update(updatedData)
            .eq('id', currentEvent.id);

        if (error) {
            alert("Failed to update event: " + error.message);
            return;
        }

        document.getElementById("editModal").style.display = "none";
        currentEvent = { ...currentEvent, ...updatedData };
        renderEventDetails(currentEvent);
        alert("Event updated successfully!");
    });
});
