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
                <form class="edit-program-name edit-form">
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
            <!-- <form class="editCategories-form edit-form">
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
        $(`.program-details[data-program-id="${id}"]`).find(`.day#${dayIndex}`).append(`
            <div class="exercise-info edit-exercise" data-program-id="${id}" data-exercise-id="${exerciseId}" id="${exerciseInfoId}">
                <form class="edit-form">
                <span class="exercise-name">${day.exercises[i].exercise.name}</span>: 
                </form>
            </div>

        `);


        const exercise = day.exercises[i];
        const type = exercise.type;
        let html;
        switch (type) {
            case 'sets & reps':
                // if (!(exercise.sets || exercise.reps)) {
                //     break;
                // }
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.sets}" readonly></input> x 
                        <input type="number" class="exerciseDetails view" value="${exercise.reps}" readonly></input>
                `;
                break;
            case 'reps & time':
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitTime}" readonly></input>
                `;
                break;
            case 'reps & distance':
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.reps}" readonly></input> x
                        <input type="number" class="exerciseDetails view" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitLength}" readonly></input>
                `;
                break;

            case 'distance & time':
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitLength}" readonly></input> in 
                        <input type="number" class="exerciseDetails view" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitTime}" readonly></input>
                    `;
                break;

            case 'reps':
                if (!(day.exercises[i].reps)) {
                    break;
                };
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.reps}" readonly></input>
                `
                break;

            case 'distance':
                // if (!(exercise.distance)) {
                //     break;
                // };
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.distance}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitLength}" readonly></input>
                `;
                break;
            case 'time':
                // if (!(exercise.time)) {
                //     break;
                // };
                html = `
                    <br />
                        <input type="number" class="exerciseDetails view" value="${exercise.time}" readonly></input>
                        <input type="text" class="exerciseDetails view" value="${exercise.unitTime}" readonly></input>
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
        $(this).parent().siblings('form').find('.programName').toggleClass('editable');

        // if (!($(this).parent().siblings('form').hasClass('editable'))) {
        //     $(this).parent().siblings('form').toggleClass('view');
        // }
    })
}

function editExercise() {
    $('main').on('click', '.edit-exercise', function (event) {
        event.preventDefault();

        $(this).children('form').children('input').removeClass('view');
        
        if ($(this).children('form').find('input').attr('readonly')) {
            $(this).children('form').find('input').removeAttr('readonly');
            const programId = $(this).closest('.program-details').attr('data-program-id');
            console.log('hehe')
            $(this).find('.edit-form').append(`
                <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
            `)
        }

        // if ($(this).hasClass('sets-reps')) {
        //     // this.append('<button>save</button>')
        //     const inputText = $(this).text();
        //     const inputHtml = $(this).html();
        //     console.log('inputHtml: ', inputHtml);
        //     $(this).html('');
        //     $(this).append(`
        //         <form class="edit-day-name edit-form">
        //             Sets: <input type="text" class="editable view" value="${exercise.sets}" readonly></input>
        //             Reps: <input type="text" class="editable view" value="${exercise.reps}" readonly></input>
        //         </form>
        //     `)
        // }

        // if has class sets-reps, distance-time, or whatever, create X 
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
            const programId = $(this).closest('.program-details').attr('data-program-id');
            $(this).closest('form').append(`
                <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
            `)
        }

        if ($(this).hasClass('categories')) {
            const programId = $(this).closest('.program-details').attr('data-program-id');
            $(this).html('');
            $(this).append(`
                <form class="editCategories-form edit-form">
                    <select class="categories" multiple> 
                        <!-- <input type="radio" name="category" value="legs" /><label for="legs">Legs</label><br />
                        <input type="radio" name="category" value="back" /><label for="back">Back</label><br />
                        <input type="radio" name="category" value="chest" /><label for="chest">Chest</label><br />
                        <input type="radio" name="category" value="biceps" /><label for="biceps">Biceps</label><br />
                        <input type="radio" name="category" value="triceps" /><label for="triceps">Triceps</label><br />
                        <input type="radio" name="category" value="shoulders" /><label for="shoulders">Shoulders</label><br />
                        <input type="radio" name="category" value="fullBody" /><label for="fullBody">Full Body</label><br />
                        <input type="radio" name="category" value="cardio" /><label for="cardio">Cardio</label><br />
                        --!>
                        <option value="legs">Legs</option>
                        <option value="back">Back</option>
                        <option value="chest">Chest</option>
                        <option value="biceps">Biceps</option>
                        <option value="triceps">Triceps</option>
                        <option value="shoulders">Shoulders</option>
                        <option value="fullBody">Full Body</option>
                        <option value="cardio">Cardio</option>
                    </select>
                <button type="submit" class="js-saveEdit-button" data-program-id="${programId}">save</button>
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
    // $('.edit-form').submit(function(event){
    event.preventDefault();

    // when editing Categories
    if ($(this).closest('form').hasClass('editCategories-form')) {
        const programId = $(this).closest('.program').attr('data-program-id');
        console.log(programId);

        // (fetch(`http://localhost:8080/programs/${id}`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'Authorization': `Bearer ${bearer}`

        //         }
        //     })
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
        const schedule_id = $(this).siblings('input').attr('id');
        const id = $(this).closest('.program').attr('data-program-id');

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
                $(this).remove();
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
    }

    // save the value of the input before it's changed, if cancel, or if clicked outside of the area,
    // set it back to the original value
})
// })


displayProfile();
handleFetchButton();
toggleProgramDisplay();
editProgram();
editExercise();