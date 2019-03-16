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

function displayProfile() {
    fetch(`/users/${id}`,
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
        .then(data => {
            const userPrograms = data.userPrograms;
            const savedPrograms = data.savedPrograms;

            displayPrograms(userPrograms, savedPrograms);
        })
}

function displayWelcome(userName) {
    $('main').prepend(`
        <h1>Welcome ${userName}!</h1>
    `);
}

function displayUserProgramsDefault() {
    $('.js-user-programs').append(`
        <div class="default-display">
            You haven't created any programs<br />
            <br />
            <a href="/create-program.html">Create New Program</a>
        </div>
    `);
}

function displaySavedProgramsDefault() {
    $('.js-saved-programs').append(`
        <div class="default-display">
            You haven't saved any programs<br />
            <br />
            <a href="/search.html">Find more programs</a>
        </div>
    `);
}

function displayUserPrograms(program) {
    $('.js-user-programs').append(`
        <div class="program" data-program-id="${program._id}">
            <div class="programHeader">
                <form class="edit-form edit-program-name">
                    <!-- <h2>${program.programName}</h2>-->
                    <input type="select" class="programName view" value="${program.programName}" readonly></input>
                </form>
                <nav class="program-buttons" role="navigation">
                    <button class="js-fetch-program display-button" data-program-id="${program._id}"><i class="up"></i></button>
                </nav>
            </div>
        </div>
    `);
}

function displaySavedPrograms(program) {
    $('.js-saved-programs').append(`
        <div class="program" data-program-id="${program.id}">
            <div class="programHeader">
                <h2>${program.programName} by ${program.author}</h2>
                <nav class="program-buttons" role="navigation">
                    <button class="js-toggle-program display-button" data-program-id="${program.id}"><i class="up"></i></button>
                </div>
            </div>
        </div>
    `);
}


function displayPrograms(userPrograms, savedPrograms) {
    if (userPrograms.length === 0) {
        displayUserProgramsDefault();
    }
    else {
        userPrograms.forEach(program => {
            displayUserPrograms(program);
        })
    }

    if (savedPrograms.length === 0) {
        displaySavedProgramsDefault();
    }
    else {
        savedPrograms.forEach(program => {
            fetch(`/programs/${program}`,
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
                .then(data => {
                    const container = '.js-saved-programs';
                    displaySavedPrograms(data);
                    appendProgramDetailsForm(data, container);
                    $(`.program-details[data-program-id="${data.id}"]`).toggleClass('hidden');
                })
        })
    }
}

function handleFetchButton() {
    $('main').on('click', '.js-fetch-program', function (event) {
        event.preventDefault();
        $(this).prop('hidden', true);
        $(this).parent().siblings('form').toggleClass('editable');

        const programId = $(this).closest('.program').data('program-id');
        $(this).closest('.program-buttons').prepend(`<button class="js-toggle-program display-button" data-program-id="${programId}"><i class="down"></i></button>`);

        const container = '.js-user-programs';
        fetchProgram(programId, container);
    })
}

function fetchProgram(id, container) {
    fetch(`/programs/${id}`, {
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
            return appendProgramDetailsForm(program, container);
        })
}

function appendProgramDetailsForm(program, location) {
    const categories = program.categories.join(', ');

    if (location === '.js-user-programs') {
        $(location).find(`.program[data-program-id="${program.id}"].programName`).toggleClass('editable');
    }

    $(location).find(`.program[data-program-id="${program.id}"]`).append(`
        <div class="program-details" data-program-id="${program.id}">
            Categories: 
            <span class="editable categories">${categories}</span>
            <!-- <form class="edit-form edit-categories">
                <input type="select" class="editable categories view" value="${categories}" readonly></input>
            </form> -->
            <br /> 
            <br /> 
            Schedule:
            <br />
        </div>
    `);

    for (let i = 0; i < program.schedule.length; i++) {
        const day = program.schedule[i];
        const dayIndex = i;
        $(location).find(`.program-details[data-program-id="${program.id}"]`).append(`
                <div class="day" id="${dayIndex}">
                </div>
                <br />
            `)
        if (day.name) {
            $(location).find(`.program-details[data-program-id="${program.id}"]`).find(`.day#${dayIndex}`).append(`
            <form class="edit-day-name edit-form editable">
                <input type="text" class="day-name view" value="${day.name}" readonly></input>
            </form>
        `)
        }

        displayScheduleData(program.id, day, dayIndex, location);
    }
}

function displayScheduleData(id, day, dayIndex, location) {
    for (let i = 0; i < day.exercises.length; i++) {
        const exerciseInfoId = `infoId-${i}`;
        const exerciseId = day.exercises[i].exercise._id;
        const exercise = day.exercises[i];
        const type = exercise.type;

        $(location).find(`.program-details[data-program-id="${id}"]`).find(`.day#${dayIndex}`).append(`
            <div class="exercise-info edit-exercise" data-program-id="${id}" data-exercise-id="${exerciseId}" data-type="${type}" id="${exerciseInfoId}">
                <form class="edit-form edit-exercise-details">
                <span class="exercise-name">${day.exercises[i].exercise.name}</span>: 
                </form>
            </div>

        `);

        let html;
        switch (type) {
            case 'sets & reps':
                if (!(exercise.sets || exercise.reps)) {
                    break;
                }
                html = `
                        <input type="number" class="exerciseDetails view sets" min="0" max="100" value="${exercise.sets}" readonly></input> x 
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input>
                `;
                break;
            case 'reps & time':
                html = `
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view time" min="0" max="999" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view unitTime" value="${exercise.unitTime}" readonly></input>
                `;
                break;
            case 'reps & distance':
                html = `
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view distance" min="0" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view unitLength" value="${exercise.unitLength}" readonly></input>
                `;
                break;

            case 'distance & time':
                html = `
                        <input type="number" class="exerciseDetails view distance" min="0" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view unitLength" value="${exercise.unitLength}" readonly></input> in 
                        <input type="number" class="exerciseDetails view time" min="0" max="999" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view unitTime" value="${exercise.unitTime}" readonly></input>
                    `;
                break;

            case 'reps':
                if (!(day.exercises[i].reps)) {
                    break;
                };
                html = `
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input>
                `
                break;

            case 'distance':
                if (!(exercise.distance)) {
                    break;
                };
                html = `
                        <input type="number" class="exerciseDetails view distance" min="0" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view unitLength" value="${exercise.unitLength}" readonly></input>
                `;
                break;
            case 'time':
                if (!(exercise.time)) {
                    break;
                };
                html = `
                        <input type="number" class="exerciseDetails view time" min="0" max="999" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view unitTime" value="${exercise.unitTime}" readonly></input>
                `;
                break;
        }

        $(location).find(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).find('form').append(html);

        if (exercise.comments) {
            $(location).find(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).find('form').append(`
                <br />Comments: <input type="text" class="exerciseComments view" value="${exercise.comments}" readonly></input>
            `);
        }
    }
    $('.js-saved-programs').find('.editable').removeClass('editable');
    $('.js-saved-programs').find('.edit-exercise').removeClass('edit-exercise');
}

function toggleProgramDisplay() {
    $('main').on('click', '.js-toggle-program', function (event) {
        event.preventDefault();
        if ($(this).css( "transform") == 'none' ){
            $(this).css("transform","rotate(180deg)");
        } else {
            $(this).css("transform","");
        }
        
        const programDetails = $(this).closest('div').siblings(`.program-details`);
        $(programDetails).toggleClass('hidden');
        $(this).parent().siblings('form').toggleClass('editable');

        if ($(programDetails).hasClass('hidden')) {
            if(!($(this).parent().siblings('form').children('input').hasClass('view'))) {
                $(this).parent().siblings('form').children('input').toggleClass('view').attr('readonly','readonly');
                $(this).siblings('.js-saveEdit-button').remove();
            }
        }
    })
}

function addButtons(programId) {
    return `
        <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
    `;
}

function editExercise() {
    $('main').on('click', '.edit-exercise', function (event) {
        event.preventDefault();

        $(this).children('form').children('input').removeClass('view');

        if ($(this).children('form').find('input').attr('readonly') === 'readonly') {
            $(this).children('form').find('input').removeAttr('readonly');
            const programId = $(this).closest('.program-details').attr('data-program-id');
            $(this).find('.edit-form').append(addButtons(programId));
        }

        const unitTimeInput = $(this).children('form').find('input.unitTime');
        if (unitTimeInput) {
            unitTimeInput.replaceWith(`
                <select name="unitTime" class="unitTime">
                    <option value="min">min</option>
                    <option value="hr">hr</option>
                    <option value="s">s</option>
                </select>
            `)
        }

        const unitLengthInput = $(this).children('form').find('input.unitLength');
        if (unitLengthInput) {
            unitLengthInput.replaceWith(`
                <select name="unitLength" class="unitLength">
                    <option value="m">m</option>
                    <option value="km">km</option>
                    <option value="ft">ft</option>
                    <option value="mi">mi</option>
                </select>
            `)
        }

    })
}

function editProgram() {
    $('main').on('click', '.editable', function (event) {
        event.preventDefault();
        $(this).children('input').removeClass('view');

        if ($(this).children('input').attr('readonly')) {
            $(this).children('input').removeAttr('readonly');
            const programId = $(this).closest('.program').attr('data-program-id');

            if ($(this).children('input').hasClass('programName')) {
                $(this).siblings('nav').append(addButtons(programId));  
            } else {
                $(this).closest('form').append(addButtons(programId));
            }
        }
        if ($(this).hasClass('categories')) {
            console.log($(this).val())
            const programId = $(this).closest('.program-details').attr('data-program-id');
            $(this).replaceWith(`
                <form class="edit-form edit-categories">
                    <select class="categories" multiple> 
                        <option value="legs">Legs</option>
                        <option value="back">Back</option>
                        <option value="chest">Chest</option>
                        <option value="biceps">Biceps</option>
                        <option value="triceps">Triceps</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="full body">Full Body</option>
                        <option value="cardio">Cardio</option>
                    </select>
                    <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>

                </form>
            `)
        }

    })

}

$('body').on('click', '.js-saveEdit-button', function (event) {
    event.preventDefault();

    // when editing Categories
    if ($(this).closest('form').hasClass('edit-categories')) {
        const programId = $(this).closest('.program').attr('data-program-id');
        const newCategories = $(this).siblings('.categories').val();

        const obj = {};
        obj['id'] = programId;
        obj['categories'] = newCategories;

        fetch(`/programs/${programId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                },
                body: JSON.stringify(obj)
            })
            .then(res => {
                if (res.ok) {
                    $(this).siblings('.categories').replaceWith(`<span class="editable categories">${newCategories.join(', ')}</span>`);
                    $(this).remove();
                }
                else {
                    throw Error(`Request rejected with status ${res.status}`);
                }
            })
    }

    // Editing Program Name 
    if ($(this).parent().siblings('form').hasClass('edit-program-name')) {
        const newProgName = $(this).parent().siblings('form').find('input').val();
        const id = $(this).closest('.program').attr('data-program-id');

        const obj = {};
        obj['id'] = id;
        obj['programName'] = newProgName;

        fetch(`/programs/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                },
                body: JSON.stringify(obj)
            })
            .then(res => {
                if (res.ok) {
                    $(this).parent().siblings('form').find('input').toggleClass('view').attr('readonly', 'readonly');
                    $(this).remove();
                }
                else {
                    throw Error(`Request rejected with status ${res.status}`);
                }
            })
    }

    // Editing Day's Name 
    if ($(this).closest('form').hasClass('edit-day-name')) {
        const newName = $(this).siblings('input').val();
        const id = $(this).closest('.program').attr('data-program-id');
        const schedule_id = $(this).closest('div.day').attr('id');

        const obj = {};
        obj['id'] = id;
        obj['name'] = newName;

        fetch(`/programs/${id}/schedule/${schedule_id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                },
                body: JSON.stringify(obj)
            })
            .then(res => {
                if (res.ok) {
                    $(this).siblings('input').toggleClass('view').attr('readonly', 'readonly');
                    $(this).remove();
                }
                else {
                    throw Error(`Request rejected with status ${res.status}`);
                }
            })
    }

    if ($(this).closest('form').hasClass('edit-exercise-details')) {
        const id = $(this).closest('.program').attr('data-program-id');
        const exercise = $(this).closest('div.exercise-info').attr('data-exercise-id');
        const type = $(this).closest('div.exercise-info').attr('data-type');

        const obj = {};
        obj['id'] = id;
        obj['exercise'] = exercise;
        obj['type'] = type;

        switch (type) {
            case 'sets & reps':
                obj['sets'] = $(this).siblings('.sets').val();
                obj['reps'] = $(this).siblings('.reps').val();
                break;
            case 'reps & time':
                obj['reps'] = $(this).siblings('.reps').val();
                obj['time'] = $(this).siblings('.time').val();
                obj['unitTime'] = $(this).siblings('.unitTime').val();
                break;
            case 'reps & distance':
                obj['reps'] = $(this).siblings('.reps').val();
                obj['distance'] = $(this).siblings('.distance').val();
                obj['unitLength'] = $(this).siblings('.unitLength').val();
                break;

            case 'distance & time':
                obj['distance'] = $(this).siblings('.distance').val();
                obj['unitLength'] = $(this).siblings('.unitLength').val();
                obj['time'] = $(this).siblings('.time').val();
                obj['unitTime'] = $(this).siblings('.unitTime').val();
                break;

            case 'reps':
                obj['reps'] = $(this).siblings('.reps').val();
                break;

            case 'distance':
                obj['distance'] = $(this).siblings('.distance').val();
                obj['unitLength'] = $(this).siblings('.unitLength').val();
                break;
            case 'time':
                obj['time'] = $(this).siblings('.time').val();
                obj['unitTime'] = $(this).siblings('.unitTime').val();
                break;
        }

        if ($(this).siblings('.exerciseComments')[0] && $(this).siblings('.exerciseComments').val().length > 0) {
            obj['comments'] = $(this).siblings('.exerciseComments').val();
        }

        const schedule_id = $(this).closest('div.day').attr('id');
        const exerciseIdArray = $(this).closest('div.exercise-info').attr('id').split('-');
        const exercise_id = exerciseIdArray[1];
        fetch(`/programs/${id}/schedule/${schedule_id}/exercises/${exercise_id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                },
                body: JSON.stringify(obj)
            })
            .then(res => {
                if (res.ok) {
                    $(this).siblings('input').toggleClass('view').attr('readonly', 'readonly');
                    $(this).siblings('select.unitLength').replaceWith(`<input type="text" class="exerciseDetails view unitLength" value="${$(this).siblings('.unitLength').val()}" readonly="">`);
                    $(this).siblings('select.unitTime').replaceWith(`<input type="text" class="exerciseDetails view unitTime" value="${$(this).siblings('.unitTime').val()}" readonly="">`);
                    $(this).siblings('button').remove();
                    $(this).remove();
                }
                else {
                    throw Error(`Request rejected with status ${res.status}`);
                }
            })
    }
})


displayProfile();
handleFetchButton();
toggleProgramDisplay();
editProgram();
editExercise();