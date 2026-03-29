// Navigation Logic
const navLinks = document.querySelectorAll('.nav-links a');
const views = document.querySelectorAll('.view');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('data-target');
        if (targetId) {
            e.preventDefault();
            navigateTo(targetId);
        }
    });
});

function navigateTo(targetId) {
    // Update nav links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId && !link.classList.contains('btn-nav')) {
            link.classList.add('active');
        }
    });

    // Toggle views
    views.forEach(view => {
        view.classList.remove('active-view');
        if (view.id === targetId) {
            view.classList.add('active-view');
            // Re-trigger animations by removing and adding elements
            const animatedElements = view.querySelectorAll('.fade-in');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; /* trigger reflow */
                el.style.animation = null; 
            });
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Booking App Logic
let bookingState = {
    service: null,
    stylist: null,
    date: null,
    time: null
};

// Start booking process directly from stylist click
function bookStylist(stylistName) {
    // Reset booking state
    bookingState = {
        service: null,
        stylist: stylistName,
        date: null,
        time: null
    };
    
    // Pre-select stylist in step 2
    document.querySelectorAll('#step-2 .option-card').forEach(card => {
        card.classList.remove('selected');
        const h4 = card.querySelector('h4');
        if (h4 && h4.innerText.includes(stylistName)) {
            card.classList.add('selected');
        }
    });
    
    document.getElementById('btn-next-2').classList.remove('disabled');

    navigateTo('booking');
    
    // Reset to step 1
    goToStep(1);
}

function selectBookingOption(type, value, element) {
    bookingState[type] = value;
    
    // Update UI selection
    const container = element.parentElement;
    container.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    
    // Enable next button for this step
    const stepNum = type === 'service' ? 1 : 2;
    document.getElementById(`btn-next-${stepNum}`).classList.remove('disabled');
}

function checkStep3() {
    const dateVal = document.getElementById('booking-date').value;
    const timeVal = document.getElementById('booking-time').value;
    
    if (dateVal && timeVal) {
        bookingState.date = dateVal;
        bookingState.time = timeVal;
        
        // Show summary
        const summary = document.getElementById('booking-summary');
        summary.innerHTML = `
            <div class="summary-item">
                <span>Service</span>
                <span>${bookingState.service}</span>
            </div>
            <div class="summary-item">
                <span>Stylist</span>
                <span>${bookingState.stylist || 'Any Stylist'}</span>
            </div>
            <div class="summary-item">
                <span>Date & Time</span>
                <span>${bookingState.date} at ${bookingState.time}</span>
            </div>
            <div class="summary-item">
                <span>Total Estimate</span>
                <span>Depends on final consultation</span>
            </div>
        `;
        summary.style.display = 'block';
        
        document.getElementById('btn-next-3').classList.remove('disabled');
    } else {
        document.getElementById('booking-summary').style.display = 'none';
        document.getElementById('btn-next-3').classList.add('disabled');
    }
}

function nextStep(step) {
    // Validate current requirement before proceeding
    if (step === 2 && !bookingState.service) return;
    if (step === 3 && !bookingState.stylist && !document.getElementById('step-2').querySelector('.selected')) return;
    
    goToStep(step);
}

function prevStep(step) {
    goToStep(step);
}

function goToStep(step) {
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach(el => {
        el.classList.remove('active');
        if (parseInt(el.getAttribute('data-step')) === step) {
            el.classList.add('active');
        }
    });
    
    // Toggle form steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active-step'));
    document.getElementById(`step-${step}`).classList.add('active-step');
}

function confirmBooking() {
    if (!document.getElementById('btn-next-3').classList.contains('disabled')) {
        // Toggle view to success step
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active-step'));
        document.getElementById('step-success').classList.add('active-step');
        
        // Hide progress bar on success
        document.querySelector('.booking-progress').style.display = 'none';
        
        // Reset state for future bookings
        bookingState = { service: null, stylist: null, date: null, time: null };
        setTimeout(() => {
            // Reset form for next time silently
            document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
            document.getElementById('booking-date').value = '';
            document.getElementById('booking-time').value = '';
            document.getElementById('booking-summary').style.display = 'none';
            document.querySelectorAll('.btn.disabled').forEach(b => b.classList.add('disabled'));
            document.querySelector('.booking-progress').style.display = 'flex';
            
            // Go back to step 1 silently behind the scenes
            document.querySelectorAll('.progress-step').forEach(el => el.classList.remove('active'));
            document.querySelector('.progress-step[data-step="1"]').classList.add('active');
            
            document.getElementById('step-success').classList.remove('active-step');
            document.getElementById('step-1').classList.add('active-step');
        }, 5000); // Only rest behind the scenes
    }
}
