/* =====================================================
   CAMPUSFIX
   Campus Issue Reporting & Resolution System
   ===================================================== */


/* ================= DATA ================= */

let issues = JSON.parse(
    localStorage.getItem("campusFixIssues")
) || [];


/* ================= ELEMENTS ================= */

const issueForm = document.getElementById("issueForm");

const issuesContainer =
    document.getElementById("issuesContainer");

const recentIssues =
    document.getElementById("recentIssues");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const toast =
    document.getElementById("toast");


/* ================= SAVE DATA ================= */

function saveIssues() {

    localStorage.setItem(
        "campusFixIssues",
        JSON.stringify(issues)
    );
}


/* ================= PRIORITY SCORE ================= */

/*
   This gives each priority a simple numerical value.

   High   = 3
   Medium = 2
   Low    = 1

   The score can later be used to sort or
   prioritize reports.
*/

function getPriorityScore(priority) {

    if (priority === "High") {
        return 3;
    }

    if (priority === "Medium") {
        return 2;
    }

    return 1;
}


/* ================= SIMILAR ISSUE CHECK ================= */

/*
   This is a simple duplicate/similar issue detector.

   It compares:
   - category
   - location
   - words from the title
*/

function findSimilarIssue(title, location, category) {

    const newTitle =
        title.toLowerCase();

    const newLocation =
        location.toLowerCase();


    return issues.find(issue => {

        const sameCategory =
            issue.category === category;


        const sameLocation =
            issue.location.toLowerCase() === newLocation;


        const titleWords =
            newTitle
                .split(/\s+/)
                .filter(word => word.length > 3);


        const similarTitle =
            titleWords.some(word =>
                issue.title.toLowerCase().includes(word)
            );


        return (
            sameCategory &&
            sameLocation &&
            similarTitle
        );

    });
}


/* ================= FORM SUBMISSION ================= */

issueForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const title =
        document.getElementById("title")
            .value
            .trim();


    const category =
        document.getElementById("category")
            .value;


    const priority =
        document.getElementById("priority")
            .value;


    const location =
        document.getElementById("location")
            .value
            .trim();


    const room =
        document.getElementById("room")
            .value
            .trim();


    const description =
        document.getElementById("description")
            .value
            .trim();


    const imageInput =
        document.getElementById("image");


    /* Check for similar issue */

    const similarIssue =
        findSimilarIssue(
            title,
            location,
            category
        );


    if (similarIssue) {

        const continueSubmit = confirm(
            "A similar issue may already exist:\n\n" +
            `"${similarIssue.title}"\n\n` +
            "Do you still want to submit this report?"
        );


        if (!continueSubmit) {
            return;
        }
    }


    /* Create issue */

    const newIssue = {

        id: Date.now(),

        title: title,

        category: category,

        priority: priority,

        priorityScore:
            getPriorityScore(priority),

        location: location,

        room: room,

        description: description,

        status: "Reported",

        date: new Date().toLocaleDateString(),

        image: ""

    };


    /* Optional image */

    if (
        imageInput.files &&
        imageInput.files[0]
    ) {

        const reader =
            new FileReader();


        reader.onload = function() {

            newIssue.image =
                reader.result;


            issues.unshift(newIssue);

            saveIssues();

            issueForm.reset();

            refreshApp();

            showToast(
                "Issue submitted successfully."
            );

            window.location.hash = "issues";
        };


        reader.readAsDataURL(
            imageInput.files[0]
        );

    } else {

        issues.unshift(newIssue);

        saveIssues();

        issueForm.reset();

        refreshApp();

        showToast(
            "Issue submitted successfully."
        );

        window.location.hash = "issues";
    }

});


/* ================= RENDER ISSUES ================= */

function renderIssues() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value;


    const selectedCategory =
        categoryFilter.value;


    const filteredIssues =
        issues.filter(issue => {

            const matchesSearch =
                issue.title
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                issue.location
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                issue.description
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesStatus =
                selectedStatus === "All" ||
                issue.status === selectedStatus;


            const matchesCategory =
                selectedCategory === "All" ||
                issue.category === selectedCategory;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );

        });


    issuesContainer.innerHTML = "";


    if (filteredIssues.length === 0) {

        issuesContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">⌕</div>

                <h3>No issues found</h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>

        `;

        return;
    }


    filteredIssues.forEach(issue => {

        const card =
            document.createElement("div");


        card.className =
            "issue-card";


        card.innerHTML = `

            <div class="issue-top">

                <div>

                    <h3 class="issue-title">
                        ${escapeHTML(issue.title)}
                    </h3>

                    <p class="issue-category">
                        ${escapeHTML(issue.category)}
                    </p>

                </div>

                <span class="badge ${getPriorityClass(issue.priority)}">
                    ${escapeHTML(issue.priority)} Priority
                </span>

            </div>


            <p class="issue-description">
                ${escapeHTML(issue.description)}
            </p>


            ${
                issue.image
                ?
                `<img
                    class="issue-image"
                    src="${issue.image}"
                    alt="Attached issue image"
                >`
                :
                ""
            }


            <div class="issue-meta">

                <div class="meta-item">

                    <strong>Location</strong>

                    ${escapeHTML(issue.location)}

                </div>


                <div class="meta-item">

                    <strong>Building / Room</strong>

                    ${
                        issue.room
                        ?
                        escapeHTML(issue.room)
                        :
                        "Not provided"
                    }

                </div>


                <div class="meta-item">

                    <strong>Reported</strong>

                    ${escapeHTML(issue.date)}

                </div>


                <div class="meta-item">

                    <strong>Priority Score</strong>

                    ${issue.priorityScore} / 3

                </div>

            </div>


            <div class="issue-bottom">

                <div class="issue-badges">

                    <span class="badge ${getStatusClass(issue.status)}">
                        ${escapeHTML(issue.status)}
                    </span>

                </div>


                <div class="issue-actions">

                    <select
                        class="status-select"
                        data-id="${issue.id}"
                    >

                        <option
                            value="Reported"
                            ${issue.status === "Reported" ? "selected" : ""}
                        >
                            Reported
                        </option>

                        <option
                            value="Under Review"
                            ${issue.status === "Under Review" ? "selected" : ""}
                        >
                            Under Review
                        </option>

                        <option
                            value="In Progress"
                            ${issue.status === "In Progress" ? "selected" : ""}
                        >
                            In Progress
                        </option>

                        <option
                            value="Resolved"
                            ${issue.status === "Resolved" ? "selected" : ""}
                        >
                            Resolved
                        </option>

                    </select>


                    <button
                        class="delete-button"
                        data-id="${issue.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;


        issuesContainer.appendChild(card);

    });


    addIssueEvents();
}


/* ================= RECENT ISSUES ================= */

function renderRecentIssues() {

    recentIssues.innerHTML = "";


    const latestIssues =
        issues.slice(0, 4);


    if (latestIssues.length === 0) {

        recentIssues.innerHTML = `

            <div class="empty-recent">
                No reports yet. Create your first campus issue report.
            </div>

        `;

        return;
    }


    latestIssues.forEach(issue => {

        const item =
            document.createElement("div");


        item.className =
            "recent-issue";


        item.innerHTML = `

            <div class="recent-title">

                <strong>
                    ${escapeHTML(issue.title)}
                </strong>

                <span class="badge ${getStatusClass(issue.status)}">
                    ${escapeHTML(issue.status)}
                </span>

            </div>


            <p class="recent-location">
                ${escapeHTML(issue.location)}
                ${issue.room ? " • " + escapeHTML(issue.room) : ""}
            </p>

        `;


        recentIssues.appendChild(item);

    });

}


/* ================= ISSUE EVENTS ================= */

function addIssueEvents() {

    /* Status changes */

    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.addEventListener(
                "change",
                function() {

                    const id =
                        Number(this.dataset.id);


                    const issue =
                        issues.find(
                            item => item.id === id
                        );


                    if (issue) {

                        issue.status =
                            this.value;


                        saveIssues();

                        refreshApp();

                        showToast(
                            "Issue status updated."
                        );

                    }

                }
            );

        });


    /* Delete buttons */

    document
        .querySelectorAll(".delete-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const id =
                        Number(this.dataset.id);


                    const issue =
                        issues.find(
                            item => item.id === id
                        );


                    if (!issue) {
                        return;
                    }


                    const confirmDelete =
                        confirm(
                            `Delete "${issue.title}"?`
                        );


                    if (!confirmDelete) {
                        return;
                    }


                    issues =
                        issues.filter(
                            item => item.id !== id
                        );


                    saveIssues();

                    refreshApp();

                    showToast(
                        "Issue deleted."
                    );

                }
            );

        });

}


/* ================= STATISTICS ================= */

function updateStatistics() {

    const total =
        issues.length;


    const underReview =
        issues.filter(
            issue =>
                issue.status === "Under Review"
        ).length;


    const inProgress =
        issues.filter(
            issue =>
                issue.status === "In Progress"
        ).length;


    const resolved =
        issues.filter(
            issue =>
                issue.status === "Resolved"
        ).length;


    document.getElementById(
        "totalIssues"
    ).textContent = total;


    document.getElementById(
        "reviewIssues"
    ).textContent = underReview;


    document.getElementById(
        "progressIssues"
    ).textContent = inProgress;


    document.getElementById(
        "resolvedIssues"
    ).textContent = resolved;

}


/* ================= HELPERS ================= */

function getPriorityClass(priority) {

    if (priority === "High") {
        return "priority-high";
    }

    if (priority === "Medium") {
        return "priority-medium";
    }

    return "priority-low";
}


function getStatusClass(status) {

    if (status === "Under Review") {
        return "status-review";
    }

    if (status === "In Progress") {
        return "status-progress";
    }

    if (status === "Resolved") {
        return "status-resolved";
    }

    return "status-reported";
}


/* ================= SECURITY ================= */

/*
   Prevents user-entered text from being interpreted
   as HTML when reports are displayed.
*/

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* ================= TOAST ================= */

let toastTimer;


function showToast(message) {

    clearTimeout(toastTimer);


    toast.textContent =
        message;


    toast.classList.add("show");


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);

}


/* ================= DARK MODE ================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "campusFixTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeIcon.textContent = "☀";

        themeToggle.lastElementChild.textContent =
            "Light Mode";

    }

}


themeToggle.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        if (isDark) {

            localStorage.setItem(
                "campusFixTheme",
                "dark"
            );

            themeIcon.textContent = "☀";

            themeToggle.lastElementChild.textContent =
                "Light Mode";

        } else {

            localStorage.setItem(
                "campusFixTheme",
                "light"
            );

            themeIcon.textContent = "☾";

            themeToggle.lastElementChild.textContent =
                "Dark Mode";

        }

    }
);


/* ================= SEARCH & FILTERS ================= */

searchInput.addEventListener(
    "input",
    renderIssues
);


statusFilter.addEventListener(
    "change",
    renderIssues
);


categoryFilter.addEventListener(
    "change",
    renderIssues
);


/* ================= NAVIGATION ================= */

const navLinks =
    document.querySelectorAll(".nav-link");


navLinks.forEach(link => {

    link.addEventListener(
        "click",
        function() {

            navLinks.forEach(
                item =>
                    item.classList.remove("active")
            );


            this.classList.add("active");

        }
    );

});


/* ================= REFRESH APP ================= */

function refreshApp() {

    renderIssues();

    renderRecentIssues();

    updateStatistics();

}


/* ================= START ================= */

loadTheme();

refreshApp();
