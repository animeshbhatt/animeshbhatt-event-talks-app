document.addEventListener('DOMContentLoaded', () => {
    const scheduleContainer = document.getElementById('schedule-container');
    const categorySearchInput = document.getElementById('categorySearch');
    const searchButton = document.getElementById('searchButton');
    const resetButton = document.getElementById('resetButton');

    let allTalks = []; // Store all talks for filtering

    // Function to fetch talks from the API
    async function fetchTalks(category = '') {
        let url = '/api/talks';
        if (category) {
            url = `/api/talks/search?category=${encodeURIComponent(category)}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const talksData = await response.json();
            displaySchedule(talksData);
            if (!category) {
                allTalks = talksData; // Store all talks only on initial load
            }
        } catch (error) {
            console.error('Error fetching talks:', error);
            scheduleContainer.innerHTML = '<p>Error loading schedule. Please try again later.</p>';
        }
    }

    // Function to display the schedule
    function displaySchedule(talksToDisplay) {
        scheduleContainer.innerHTML = ''; // Clear previous schedule

        let currentTime = new Date();
        currentTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

        const talkDuration = 60; // 1 hour
        const transitionDuration = 10; // 10 minutes
        const lunchBreakDuration = 60; // 1 hour

        let talksRendered = 0;

        for (let i = 0; i < talksToDisplay.length; i++) {
            const talk = talksToDisplay[i];

            // Add transition before each talk except the first one or after lunch
            if (i > 0 && talksRendered !== 3) { // Assuming lunch is after the 3rd talk
                currentTime.setMinutes(currentTime.getMinutes() + transitionDuration);
            }

            // Check for lunch break after the 3rd talk
            if (talksRendered === 3) {
                const lunchStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + lunchBreakDuration);
                const lunchEndTime = new Date(currentTime);

                scheduleContainer.innerHTML += `
                    <div class="talk-card lunch-break">
                        <h3>Lunch Break</h3>
                        <p>${lunchStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                           ${lunchEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                `;
            }

            const talkStartTime = new Date(currentTime);
            currentTime.setMinutes(currentTime.getMinutes() + talkDuration);
            const talkEndTime = new Date(currentTime);

            const speakersHtml = talk.speakers.map(speaker => `<span>${speaker}</span>`).join('');
            const categoriesHtml = talk.category.map(cat => `<span>${cat}</span>`).join('');

            scheduleContainer.innerHTML += `
                <div class="talk-card">
                    <h3>${talk.title}</h3>
                    <p><strong>Time:</strong> ${talkStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                          ${talkEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p class="speakers"><strong>Speakers:</strong> ${speakersHtml}</p>
                    <p><strong>Description:</strong> ${talk.description}</p>
                    <div class="categories"><strong>Categories:</strong> ${categoriesHtml}</div>
                </div>
            `;
            talksRendered++;
        }
    }

    // Event Listeners for search functionality
    searchButton.addEventListener('click', () => {
        const category = categorySearchInput.value.trim();
        fetchTalks(category);
    });

    resetButton.addEventListener('click', () => {
        categorySearchInput.value = '';
        fetchTalks(); // Fetch all talks again
    });

    categorySearchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    // Initial load of the schedule
    fetchTalks();
});
