const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

if (!bearer) {
    $('main').html(`
        <div class="unauthorized">
            <b>ERROR 404</b> unauthorized<br />
            <span class="login">Please <a href="/login.html">log in to view</a></span>
        </div>
    `);
}

$('main').on('click', '.js-search-button', function (event) {
    event.preventDefault();
    const searchCat = $(this).siblings('select').val();
    const q = $(this).siblings('.searchbox').val();

    $('.js-search-results').removeAttr('hidden');

    fetch(`http://localhost:8080/programs?${searchCat}=${q}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer}`
            }
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(data => { return displaySearchResults(data) })
})


function displaySearchResults(data) {
    $('.js-search-results').html('');
    $('.js-search-results').append(`
        <header class="search-header">SEARCH RESULTS</header><br/>
    `);
    if (data.length === 0) {
        $('.js-search-results').append('<div class="no-results">No results found</div>');
    }
    else {
        for (let i = 0; i < data.length; i++) {
            const program = data[i]
            displayPrograms(program);
        }
    }
}

function displayPrograms(program) {
    $('.js-search-results').append(`
        <div class="program" data-program-id="${program.id}">
            <div class="programHeader">
                <h2>${program.programName} by ${program.author}</h2>
                <nav class="program-buttons">
                    <button class="js-fetch-program" data-program-id="${program.id}"><i class="up"></i></button>
                </nav>
            </div>
        </div>
    `);
    addSaveButton(program.id);
}

function addSaveButton(programId) {
    fetch(`http://localhost:8080/users/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearer}`
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(user => {
            const savedPrograms = user.savedPrograms;

            let html;
            if (savedPrograms.includes(programId)) {
                html = `<button class="js-unsave-button unsave-button" data-program-id="${programId}">★</button>`;
            }
            else {
                html = `<button class="js-save-button save-button" data-program-id="${programId}">☆</button>`;
            }
            $(`.program[data-program-id="${programId}"]`).find('nav').append(html)
        })
}

$('main').on('click', '.js-save-button', function (event) {
    const programId = $(this).attr('data-program-id');
    const obj = {
        op: 'add',
        path: 'savedPrograms'
    };
    obj['value'] = programId;

    fetch(`/users/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`
            },
            body: JSON.stringify(obj)
        })
        .then(res => {
            if (res.ok) {
                $(this).replaceWith(`<button class="js-unsave-button unsave-button" data-program-id="${programId}">★</button>`)
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
})

$('main').on('click', '.js-unsave-button', function (event) {
    const programId = $(this).attr('data-program-id');
    const obj = {
        op: 'remove',
        path: 'savedPrograms'
    };
    obj['value'] = programId;

    fetch(`/users/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearer}`
            },
            body: JSON.stringify(obj)
        })
        .then(res => {
            if (res.ok) {
                $(this).replaceWith(`<button class="js-save-button save-button" data-program-id="${programId}">☆</button>`)

            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
})

function handleFetchButton() {
    $('main').on('click', '.js-fetch-program', function (event) {
        event.preventDefault();
        $(this).prop('hidden', true);

        const programId = $(this).closest('.program').data('program-id');
        $(this).closest('.program-buttons').prepend(`<button class="js-show-program" data-program-id="${programId}"><i class="down"></i></button>`);

        fetchProgram(programId);
    })
}

function fetchProgram(id) {
    fetch(`http://localhost:8080/programs/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearer}`
        }
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(program => {
            return appendProgramDetailsForm(program);
        })
}

function appendProgramDetailsForm(program) {
    const categories = program.categories.join(', ');

    $('.js-search-results').find(`.program[data-program-id="${program.id}"]`).append(`
        <div class="program-details" data-program-id="${program.id}">
            Categories: 
            <span class="categories">${categories}</span>
            <br /> 
            <br /> 
            Schedule:
            <br />
        </div>
    `);

    for (let i = 0; i < program.schedule.length; i++) {
        const day = program.schedule[i];
        const dayIndex = i;
        $(`.program-details[data-program-id="${program.id}"]`).append(`
            <div class="day" id="${dayIndex}">
            </div>
            <br />
        `)
        if (day.name) {
            $(`.program-details[data-program-id="${program.id}"]`).find(`.day#${dayIndex}`).append(`<b>${day.name}</b>`)
        }
        displayScheduleData(program.id, day, dayIndex);
    }
}

function displayScheduleData(id, day, dayIndex) {
    for (let i = 0; i < day.exercises.length; i++) {
        const exerciseInfoId = `infoId-${i}`;
        const exerciseId = day.exercises[i].exercise._id;
        const exercise = day.exercises[i];
        const type = exercise.type;

        $(`.program-details[data-program-id="${id}"]`).find(`.day#${dayIndex}`).append(`
            <div class="exercise-info" data-program-id="${id}" data-exercise-id="${exerciseId}" data-type="${type}" id="${exerciseInfoId}">
                ${day.exercises[i].exercise.name}: 
            </div>

        `);

        let html;
        switch (type) {
            case 'sets & reps':
                if (!(exercise.sets || exercise.reps)) {
                    break;
                }
                html = `${exercise.sets} x ${exercise.reps}`;
                break;
            case 'reps & time':
                html = `${exercise.reps} x ${exercise.time} ${exercise.unitTime}`;
                break;
            case 'reps & distance':
                html = `${exercise.reps} x ${exercise.distance} ${exercise.unitLength}`;
                break;
            case 'distance & time':
                html = `${exercise.distance} ${exercise.unitLength} in ${exercise.time} ${exercise.unitTime}`;
                break;
            case 'reps':
                if (!(day.exercises[i].reps)) {
                    break;
                };
                html = `${exercise.reps}`
                break;
            case 'distance':
                if (!(exercise.distance)) {
                    break;
                };
                html = `${exercise.distance} ${exercise.unitLength}`;
                break;
            case 'time':
                if (!(exercise.time)) {
                    break;
                };
                html = `${exercise.time} ${exercise.unitTime}`;
                break;
        }

        $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).append(html);

        if (exercise.comments) {
            $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).append(`
                <br />Comments: ${exercise.comments}
            `);
        }
    }
}


$('main').on('click', '.js-show-program', function (event) {
    event.preventDefault();
    if ($(this).css("transform") == 'none') {
        $(this).css("transform", "rotate(180deg)");
    } else {
        $(this).css("transform", "");
    }

    const programDetails = $(this).closest('div').siblings(`.program-details`);
    $(programDetails).toggleClass('hidden');
})


handleFetchButton();