const bearer = localStorage.authToken;
const id = localStorage.userId;

function displayProfile() {
    // const id;
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
                <h2>${program.programName}</h2>
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

    $(location).find(`.program[data-program-id="${program.id}"]`).append(`
        <div class="program-details" data-program-id="${program.id}">
            Categories: 
            <!-- <span class="editable categories">${categories}</span> --!>
            <form class="editCategories-form edit-form">
                <input type="select" class="editable categories view" value="${categories}" readonly></input>
            </form>
            <br /> 
            <br /> 
            Schedule:
            <br />
        </div>
    `);

    for (let i = 0; i < program.schedule.length; i++) {
        const day = program.schedule[i];
        if (day.name) {
            // $(`#${program.id}-details`).append(`
            $(`.program-details[data-program-id="${program.id}"]`).append(`
                <span class="day-name editable">${day.name}:</span>
                <br />
            `)
        }
        displayScheduleData(program.id, day);
    }
}

function toggleProgramDisplay() {
    $('main').on('click', '.js-show-program', function (event) {
        event.preventDefault();
        const programId = $(this).attr('data-program-id');
        // console.log(programId);
        $(this).closest('div').siblings(`.program-details`).toggleClass('hidden');
    })
}

function editProgram() {
    $('main').on('click', '.editable', function (event) {
        event.preventDefault();
        console.log('this', this)
        $(this).toggleClass('view');

        if ($(this).attr('readonly')) {
            $(this).removeAttr('readonly');
            $(this).closest('form').append(`
            <button type="submit" class="js-editSection-button">save</button>
        `)
        }
        else {
            $(this).attr('readonly', 'readonly');
            $('.js-editSection-button').remove();
        }
        
        // if ($(this).hasClass('categories')) {
        //     // this.append('<button>save</button>')
        //     const inputText = $(this).text();
        //     $(this).html('');
        //     $(this).append(`
        //         <form class="edit-form">
        //             <input type="text" class="editable categories" value=${inputText}></input>
        //             <button type="submit">save</button>
        //         </form>
        //     `)
        // }
        // if has class sets-reps, distance-time, or whatever, create X 

    })

}

// $(function handleEditButton() {
    $('body').on('click', '.edit-form .js-editSection-button', function(event){
        // $('.edit-form').submit(function(event){
        event.preventDefault();


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
    })
// })





function displayScheduleData(id, day) {
    for (let i = 0; i < day.exercises.length; i++) {
        const exerciseId = day.exercises[i].exercise._id; 
        $(`.program-details[data-program-id="${id}"]`).append(`
            <div class="exercise-info editable" data-program-id="${id}" data-exercise-id="${exerciseId}">
                <span class="exercise-name">${day.exercises[i].exercise.name}</span>:
            </div>
        `);

        const type = day.exercises[i].type;
        switch (type) {
            case 'sets & reps':
                if (!(day.exercises[i].sets || day.exercises[i].reps)) {
                    break;
                }
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="sets-reps">
                        ${day.exercises[i].sets} x ${day.exercises[i].reps}
                    </span>
                    <br />
                `);
                break;
            case 'reps & time':
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="reps-time">
                        ${day.exercises[i].reps} x ${day.exercises[i].time} ${day.exercises[i].unitTime}
                    </span>
                    <br />
                `);
                break;
            case 'reps & distance':
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="reps-distance">
                        ${day.exercises[i].reps} x ${day.exercises[i].distance} ${day.exercises[i].unitLength}
                    </span>
                    <br />
                `);
                break;
            case 'distance & time':
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="distance-time">
                        ${day.exercises[i].distance} ${day.exercises[i].unitLength} in ${day.exercises[i].time} ${day.exercises[i].unitTime}
                    </span>
                    <br />    
                `);
                break;

            case 'reps':
                if (!(day.exercises[i].reps)) {
                    break;
                };
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="reps">
                        ${day.exercises[i].reps}
                    </span>
                    <br />
                `);
                break;

            case 'distance':
                if (!(day.exercises[i].distance)) {
                    break;
                };
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="distance">
                        ${day.exercises[i].distance} ${day.exercises[i].unitLength}
                    </span>
                    <br />
                `);
                break;
            case 'time':
                if (!(day.exercises[i].time)) {
                    break;
                };
                $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                    <span class="time">
                        ${day.exercises[i].time} ${day.exercises[i].unitTime}
                    </span>
                    <br />
                `);
                break;
        }

        if (day.exercises[i].comments) {
            $(`.exercise-info[data-program-id="${id}"][data-exercise-id="${exerciseId}"]`).append(`
                <br />
                <i>
                    Comments: ${day.exercises[i].comments}<br />
                </i>
            `);
        }
    }
}

displayProfile();
createProgramObj();


function addProgram() {
    $('main').on('click', '.js-add-button', function (event) {
        event.preventDefault();
        $('.js-add-button').prop('hidden', true);
        $('.js-user-programs').prop('hidden', true);
        $('.js-saved-programs').prop('hidden', true);
        $('.js-add-programs').append(`
            <form class="js-add-program-form add-program-form">
                <label for="program-name">Program Name:</label>
                <input type="text" class="programName">

                <br /> 
                <label for="categories">Categories:</label>
                <select class="categories" multiple>
                    <option value="legs">Legs</option>
                    <option value="back">Back</option>
                    <option value="chest">Chest</option>
                    <option value="biceps">Biceps</option>
                    <option value="triceps">Triceps</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="fullBody">Full Body</option>
                    <option value="cardio">Cardio</option>
                </select>

                <br /> 
                <label for="programLength">Program Length (in days):</label>
                <input type="number" min="1" max="365" class="programLength">

                <button type="submit" class="js-add-progLength">Add Length</button>
            </form>
        `);
        addProgLength();
    })
}

function addProgLength() {
    $('.js-add-program-form').on('click', '.js-add-progLength', function (event) {
        event.preventDefault();
        $('.js-add-progLength').prop('hidden', true);
        const programLength = $('.programLength').val();
        $('.js-add-program-form').append(`
            <br />
            <br />
            Schedule:
        `);

        if (programLength == 1) {
            $('.js-add-program-form').append(`
                <div class="day">
                    <div class="exercises">
                        <div class="exercise">
                            <label for="exercise-name">Exercise Name:</label>
                            <input type="text" class="exercise-name">
                            <br /> 

                            <label for="exercise-type">Exercise Type:</label>
                            <select name="exercise-type" class="exercise-type">
                                <option disabled selected value>-- select option --</option>
                                <option value="sets-reps">sets & reps</option>
                                <option value="reps-time">reps & time</option>
                                <option value="reps-distance">reps & distance</option>
                                <option value="distance-time">distance & time</option>
                                <option value="reps">reps</option>
                                <option value="distance">distance</option>
                                <option value="time">time</option>
                            </select>
                            <br />

                            <button class="js-remove-exercise">Remove this Exercise</button>
                        </div>
                    </div>
                </div>
                <button class="js-add-exercise">Add Another Exercise</button>
            `);
        }
        else {
            for (let i = 0; i < programLength; i++) {
                $('.js-add-program-form').append(`
                    <br />
                    <div class="day">
                        <label for="name">Name:</label>
                        <input type="text" class="name" placeholder="e.g. Day 1: Legs">
                        <br />
                        <div class="exercises">
                            <button class="js-add-prog-exercise">Add Exercise</button>
                        </div>
                    </div>
                `)
            }
        }
        $('.js-add-program-form').append(`
            <br />
            <button type=submit class="js-save-program">Save Program</button>
        `)
        addExercise();
        removeExercise();
    })
}

$('main').on('change', '.exercise-type', function (event) {
    event.preventDefault();
    const menu = event.target;
    addExerciseDetails(menu, $(this).val())
});

function addExerciseDetails(menu, type) {
    $(menu).siblings('.exercise-details').remove();
    let html;
    switch (type) {
        case 'sets-reps':
            html = getSetsReps();
            break;
        case 'reps-time':
            html = getRepsTime();
            break;
        case 'reps-distance':
            html = getRepsDistance();
            break;
        case 'distance-time':
            html = getDistanceTime();
            break;

        case 'reps':
            html = getReps();
            break;

        case 'distance':
            html = getDistance();
            break;
        case 'time':
            html = getTime();
            break;
    }

    $(`<div class="exercise-details">
            ${html}
            <label for="comments">Comments:</label>
            <input type="text" class="comments">
        </div>
    `).insertAfter(menu)
}

function getSetsReps() {
    return `<br />
        <label for="sets">Sets:</label>
        <input type="number" min="0" max="100" class="sets">
        <br /> 

        <label for="reps">Reps:</label>
        <input type="number" min="0" class="reps">
        <br />
    `
}

function getRepsTime() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" class="reps">
        <br /> 

        <label for="time">Time:</label>
        <input type="number" class="time">

        <select name="unitTime" class="unitTime">
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select>
        <br /> 
    `
}

function getRepsDistance() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" class="reps">
        <br /> 

        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance">

        <select name="unitLength" class="unitLength">
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select>
        <br /> 
    `
}

function getDistanceTime() {
    return `<br />
        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance">

        <select name="unitLength" class="unitLength">
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select>
        <br /> 

        <label for="time">Time:</label>
        <input type="number" class="time">

        <select name="unitTime" class="unitTime">
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select>
        <br /> 
    `
}

function getReps() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" class="reps">
        <br /> 
    `
}

function getDistance() {
    return `<br />
        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance">

        <select name="unitLength" class="unitLength">
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select>
        <br /> 
    `
}

function getTime() {
    return `<br />
        <label for="time">Time:</label>
        <input type="number" class="time">

        <select name="unitTime" class="unitTime">
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select>
        <br /> 
    `
}
// function getDataFromApi(searchTerm, callback) {
//     const settings = {
//       url: GITHUB_SEARCH_URL,
//       data: {
//         q: `${searchTerm} in:name`,
//         per_page: 5
//       },
//       dataType: 'json',
//       type: 'GET',
//       success: callback
//     };

//     $.ajax(settings);
//   }

$(function autocomplete() {
    const exerciseOptions = {
        url: "http://localhost:8080/exercises",
        ajaxSettings: {
            dataType: "json",
            method: 'GET'
        },
        getValue: 'name',
        list: {
            match: {
                enabled: true
            }
        },
        theme: "square"
    };

    $('.exercise-name').easyAutocomplete(exerciseOptions);
});


function createProgramObj() {
    $('main').on('click', '.js-save-program', function (event) {
        event.preventDefault();

        const programObj = {};
        programObj['programName'] = $('.programName').val();
        programObj['categories'] = $('.categories').val();
        programObj['schedule'] = createSchedule();

        console.log('programObj: ', programObj)
    })
}

function createSchedule() {
    const schedule = [];
    $('.day').each(function (index, day) {
        const dayObj = {};

        if ($('.name')) {
            const name = $(day).find('.name').first().val();
            dayObj['name'] = name;
        }

        dayObj['exercises'] = createExercises(day);

        schedule.push(dayObj);
    })
    return schedule;
}

function createExercises(day) {
    const exercisesArray = [];
    const exercises = $(day).find('.exercise')

    $(exercises).each(function (index, exercise) {
        const exerciseObj = {};
        const name = $(exercise).find('.exercise-name').first().val();
        const type = $(exercise).find('.exercise-type').first().val();
        const comments = $(exercise).find('.comments').first().val();
        const descriptors = type.split('-');

        if (descriptors.includes('time')) {
            const unitTime = $(exercise).find('.unitTime').first().val();
            exerciseObj['unitTime'] = unitTime;
        }
        if (descriptors.includes('distance')) {
            const unitLength = $(exercise).find('.unitLength').first().val();
            exerciseObj['unitLength'] = unitLength;

        }

        exerciseObj['name'] = name;
        exerciseObj['type'] = type;

        exerciseObj[`${descriptors[0]}`] = $(exercise).find(`.${descriptors[0]}`).first().val();
        if (descriptors[1]) {
            exerciseObj[`${descriptors[1]}`] = $(exercise).find(`.${descriptors[1]}`).first().val();
        }
        exerciseObj['comments'] = comments;

        exercisesArray.push(exerciseObj);
    })

    return exercisesArray;
}

function addExercise() {
    const newProgram = `
        <div class="exercise">
            <label for="exercise-name">Exercise Name:</label>
            <input type="text" class="exercise-name">
            <br /> 

            <label for="exercise-type">Exercise Type:</label>
            <select name="exercise-type" class="exercise-type">
                <option disabled selected value>-- select option --</option>
                <option value="sets-reps">sets & reps</option>
                <option value="reps-time">reps & time</option>
                <option value="reps-distance">reps & distance</option>
                <option value="distance-time">distance & time</option>
                <option value="reps">reps</option>
                <option value="distance">distance</option>
                <option value="time">time</option>
            </select>
            <br />

            <button class="js-remove-exercise">Remove this Exercise</button>
        </div>
    `
    $('.js-add-program-form').on('click', '.js-add-exercise', function (event) {
        event.preventDefault();
        $('.exercises').append(newProgram);
    });
    $('.js-add-program-form').on('click', '.js-add-prog-exercise', function (event) {
        event.preventDefault();
        $(this).before(newProgram);
    });
}

function removeExercise() {
    $('.js-add-program-form').on('click', '.js-remove-exercise', function (event) {
        event.preventDefault();
        $(this).parent().remove();
    });
}


$(addProgram);
handleFetchButton();
toggleProgramDisplay();
editProgram();