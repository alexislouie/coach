const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

function displayProfile() {
    fetch(`http://localhost:8080/users/${id}`,
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
            displayHeader(data.userName);
            displayPrograms(userPrograms, savedPrograms);
        })
}

function displayHeader(userName) {
    $('main').prepend(`
        <h1>Welcome Back ${userName}!</h1>
    `);
}

function displayUserProgramsDefault() {
    $('.js-user-programs').append(`
        <div>
            <span>You haven't created any programs</span>
            <br /> 
            <span>Click Here to Add Program</span>
        </div>
    `);
}

function displayUserPrograms(program) {
    $('.js-user-programs').append(`
        <div class="program" data-program-id="${program._id}">
            <div class="programHeader">
                <form class="edit-form edit-program-name">
                    <!-- <h2>${program.programName}</h2>--!>
                    <input type="select" class="programName view" value="${program.programName}" readonly></input>
                </form>
                <nav class="program-buttons">
                    <button class="js-fetch-program" data-program-id="${program._id}">show</button>
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
                <nav class="program-buttons">
                    <button class="js-show-program" data-program-id="${program.id}">toggle</button>
                </div>
            </div>
        </div>
    `);
}

function displaySavedProgramsDefault() {
    $('.js-saved-programs').append(`
        <div class="programHeader">
            <span>You haven't saved any programs</span>
            <br /> 
            <span>Click here to search our catalog of programs</span>
        </div>
    `);
}

function displayPrograms(userPrograms, savedPrograms) {
    if (!userPrograms) {
        displayUserProgramsDefault();
    }
    else {
        userPrograms.forEach(program => {
            displayUserPrograms(program);
        })
    }

    if (!savedPrograms) {
        displaySavedProgramsDefault();
    }
    else {
        savedPrograms.forEach(program => {
            fetch(`http://localhost:8080/programs/${program}`,
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
        $(this).closest('.program-buttons').prepend(`<button class="js-show-program" data-program-id="${programId}">toggle</button>`);

        const container = '.js-user-programs';
        fetchProgram(programId, container);
    })
}

function fetchProgram(id, container) {
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
            return appendProgramDetailsForm(program, container);
        })
}

function appendProgramDetailsForm(program, location) {
    const categories = program.categories.join(', ');

    // put all user programs stuff in this and toggle the 'editable' class 
    if (location === '.js-user-programs') {
        $(location).find(`.program[data-program-id="${program.id}"].programName`).toggleClass('editable');
    }

    $(location).find(`.program[data-program-id="${program.id}"]`).append(`
        <div class="program-details" data-program-id="${program.id}">
            Categories: 
            <span class="editable categories">${categories}</span>
            <!-- <form class="edit-form edit-categories">
                <input type="select" class="editable categories view" value="${categories}" readonly></input>
            </form> --!>
            <br /> 
            <br /> 
            Schedule:
            <br />
        </div>
    `);

    for (let i = 0; i < program.schedule.length; i++) {
        const day = program.schedule[i];
        const dayIndex = i; 
        if (day.name) {
            $(`.program-details[data-program-id="${program.id}"]`).append(`
                <div class="day" id="${dayIndex}">
                    <form class="edit-day-name edit-form editable">
                        <input type="text" class="day-name view" value="${day.name}" readonly></input>
                    </form>
                </div>
                <br />
            `)
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
                    <br />
                        <input type="number" class="exerciseDetails view sets" min="0" max="100" value="${exercise.sets}" readonly></input> x 
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input>
                `;
                break;
            case 'reps & time':
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view time" min="0" max="999" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view unitTime" value="${exercise.unitTime}" readonly></input>
                `;
                break;
            case 'reps & distance':
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view distance" min="0" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view unitLength" value="${exercise.unitLength}" readonly></input>
                `;
                break;

            case 'distance & time':
                html = `
                    <br />
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
                    <br />
                        <input type="number" class="exerciseDetails view reps" min="0" max="999" value="${exercise.reps}" readonly></input>
                `
                break;

            case 'distance':
                if (!(exercise.distance)) {
                    break;
                };
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view distance" min="0" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view unitLength" value="${exercise.unitLength}" readonly></input>
                `;
                break;
            case 'time':
                if (!(exercise.time)) {
                    break;
                };
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view time" min="0" max="999" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view unitTime" value="${exercise.unitTime}" readonly></input>
                `;
                break;
        }
        
        $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).find('form').append(html);
        
        if (exercise.comments) {
            $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]#${exerciseInfoId}`).find('form').append(`
                <br />Comments: <input type="text" class="exerciseComments view" value="${exercise.comments}" readonly></input>
            `);
        }
    }
}

function toggleProgramDisplay() {
    $('main').on('click', '.js-show-program', function (event) {
        event.preventDefault();
        const programDetails = $(this).closest('div').siblings(`.program-details`);
        $(programDetails).toggleClass('hidden');
        $(this).parent().siblings('form').toggleClass('editable');

        // if (!($(this).parent().siblings('form').hasClass('editable'))) {
        //     $(this).parent().siblings('form').toggleClass('view');
        // }
    })
}

function addButtons(programId) {
    return `
        <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
        <button type="submit" class="js-cancelEdit-button" data-program-id="${programId}">cancel</button>
    `;
}

function editExercise() {
    $('main').on('click', '.edit-exercise', function (event) {
        event.preventDefault();

        $(this).children('form').children('input').removeClass('view');

        if ($(this).children('form').find('input').attr('readonly') === 'readonly') {
            $(this).children('form').find('input').removeAttr('readonly');
            const programId = $(this).closest('.program-details').attr('data-program-id');
            // $(this).find('.edit-form').append(`
            //     <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
            //     <button type="submit" class="js-cancelEdit-button" data-program-id="${programId}">cancel</button> 
            // `)
            $(this).find('.edit-form').append(addButtons(programId));
            console.log('hehe')
        }

        // if the div has an input with .unitTime 
        // replace that specific input with select input dropdown thing (use replaceWith())
        // append select 
        // when SAVING, set variable to the new selected value 
        // then REPLACE it with <input type="text" class="exerciseDetails view unitTime" value="${NEWVARIABLENAME}" readonly></input>
        if ($(this).children('form').find('input.unitTime')) {
            const unitTime = $(this).children('form').find('input.unitTime').val();
            const programId = $(this).closest('.program-details').attr('data-program-id');

            $(this).children('form').find('input.unitTime').replaceWith(`
                <select name="unitTime" class="unitTime">
                    <option value="min">min</option>
                    <option value="hr">hr</option>
                    <option value="s">s</option>
                </select>
            `)
        }

        if ($(this).children('form').find('input.unitLength')) {
            const unitLength = $(this).children('form').find('input.unitLength').val();
            const programId = $(this).closest('.program-details').attr('data-program-id');

            $(this).children('form').find('input.unitLength').replaceWith(`
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

function cancelEdit() {
    $('main').on('click', '.js-cancelEdit-button', function(event) {
        event.preventDefault();
        console.log('cancel edit button clicked')
    })
}

function editProgram() {
    $('main').on('click', '.editable', function (event) {
        event.preventDefault();
        // $(this).removeClass('view');
        $(this).children('input').removeClass('view');

        if ($(this).children('input').attr('readonly')) {
        // if ($(this).attr('readonly')) {
            // $(this).removeAttr('readonly');
            $(this).children('input').removeAttr('readonly');
            const programId = $(this).closest('.program').attr('data-program-id');
            $(this).closest('form').append(addButtons(programId));
            // $(this).closest('form').append(`
            //     <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
            //     <button type="submit" class="js-cancelEdit-button" data-program-id="${programId}">cancel</button> 
            // `)
        }
        if ($(this).hasClass('categories')) {   
            console.log($(this).val())
            const programId = $(this).closest('.program-details').attr('data-program-id');
            $(this).replaceWith(`
                <form class="edit-form edit-categories">
                    <select class="categories" multiple> 
                        <!-- <input type="radio" name="category" value="legs" /><label for="legs">Legs</label><br />
                        <input type="radio" name="category" value="back" /><label for="back">Back</label><br />
                        <input type="radio" name="category" value="chest" /><label for="chest">Chest</label><br />
                        <input type="radio" name="category" value="biceps" /><label for="biceps">Biceps</label><br />
                        <input type="radio" name="category" value="triceps" /><label for="triceps">Triceps</label><br />
                        <input type="radio" name="category" value="shoulders" /><label for="shoulders">Shoulders</label><br />
                        <input type="radio" name="category" value="full body" /><label for="fullBody">Full Body</label><br />
                        <input type="radio" name="category" value="cardio" /><label for="cardio">Cardio</label><br />
                        --!>
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
                <button type="submit" class="js-cancelEdit-button" data-program-id="${programId}">cancel</button> 
                </form>
            `)
        }
    })


    // $(document).on('click', function(event){
    //     if ($('input').not('.view')) {
    //         $('input').attr('readonly', 'readonly')
    //         $('input').toggleClass('view');
    //         $('input').siblings('.js-saveEdit-button').remove();
    //     }
    // })

}

// $(function handleEditButton() {
$('body').on('click', '.edit-form .js-saveEdit-button', function (event) {
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
                $(this).siblings('button').remove();
                $(this).remove();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
    }

    // Editing Program Name 
    if ($(this).closest('form').hasClass('edit-program-name')) {
        const newProgName = $(this).siblings('input').val();
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
                $(this).siblings('input').toggleClass('view');
                $(this).siblings('button').remove();
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
                $(this).siblings('input').toggleClass('view');
                $(this).siblings('button').remove();
                $(this).remove();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
    }

    // For editing Exercise Details
    // save the value of the input before it's changed, if cancel, or if clicked outside of the area,
    // set it back to the original value
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
                $(this).siblings('input').toggleClass('view');
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
// })


displayProfile();
handleFetchButton();
toggleProgramDisplay();
editProgram();
editExercise();
cancelEdit();