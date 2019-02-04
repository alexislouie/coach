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
            console.log(data);
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

function displayPrograms(userPrograms, savedPrograms) {
    if (!userPrograms) {
        $('.js-user-programs').append(`
            <div>
                <span>You haven't created any programs</span>
                <br /> 
                <span>Click Here to Add Program</span>
            </div>
        `);
    }
    else {
        userPrograms.forEach(program => {
            $('.js-user-programs').append(`
                <div id="program-${program._id}">
                    <div class="programHeader">
                        ${program.programName}

                            <button class="js-show-program js-show-program-${program._id}" id="${program._id}">show</button>
                            <button class="js-edit-program js-edit-program-${program._id}" id="${program._id}">edit</button>

                    </div>
                </div>
            `);
        })
    }

    if (!savedPrograms) {
        $('.js-saved-programs').append(`
            <div>
                <span>You haven't saved any programs</span>
                <br /> 
                <span>Click here to search our catalog of programs</span>
            </div>
        `);
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
                    // console.log('data from savedProgram: ', data)
                    $('.js-saved-programs').append(`
                        <div id="program-${data.id}">
                            ${data.programName} by ${data.author}
                            <button class="js-show-program js-show-program-${data.id}" id="${data.id}">show</button>
                        </div>`
                    );
                })
        })
    }
}

function editProgram() {
    // if display isn't block, run (toggleProgramDisplay() or whatever to get the program showing)
    // add style: .exercise-info:hover

}

function hideProgram() {
    $('main').on('click', '.js-hide-button', function (event) {
        event.preventDefault();
        console.log('click')
        $(this).prop('hidden', true);
        $(`#${this.id}-details`).hide();
        $(`.js-show-button-${this.id}`).prop('hidden', false);

        $(`#${this.id}`).append('<button class="js-show-button">show</button>');
    })
}

function toggleProgramDisplay() {
    $('main').on('click', '.js-show-program', function (event) {
        event.preventDefault();
        $(this).prop('hidden', true);
        $(`#program-${this.id}`).append(`<button class="js-hide-button js-hide-button-${this.id}" id="${this.id}">hide</button>`);

        if ($(`#program-${this.id}`).html().length > 0) {
            $(`#${this.id}-details`).toggleClass('hidden');
        }
        else {
        }
        // $(`#${this.id}-details`).toggleClass('hidden');

        fetch(`http://localhost:8080/programs/${this.id}`, {
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
                console.log(program);

                $(`#program-${this.id}`).append(`
                    <div id="${this.id}-details">
                        Schedule:
                        <br />
                    </div>
                `);

                for (let i = 0; i < program.schedule.length; i++) {
                    if (program.schedule[i].name) {
                        $(`#${this.id}-details`).append(`
                            ${program.schedule[i].name}: 
                            <br />
                        `)
                    }
                    console.log(program.schedule[i])
                    displayScheduleData(this.id, program.schedule[i]);
                }

            })
    })
}

function displayScheduleData(id, day) {
    for (let i = 0; i < day.exercises.length; i++) {
        $(`#${id}-details`).append(`
            <div class="${day.exercises[i].exercise._id} exercise-info">
                ${day.exercises[i].exercise.name}:
            </div>
        `);

        const type = day.exercises[i].type;
        switch (type) {
            case 'sets & reps':
                if (!(day.exercises[i].sets || day.exercises[i].reps)) {
                    break;
                }
                $(`.${day.exercises[i].exercise._id}`).append(`
                        ${day.exercises[i].sets} x ${day.exercises[i].reps}<br />
                `);
                break;
            case 'reps & time':
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].reps} x ${day.exercises[i].time} ${day.exercises[i].unitTime}<br />
                `);
                break;
            case 'reps & distance':
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].reps} x ${day.exercises[i].distance} ${day.exercises[i].unitLength}<br />
                `);
                break;
            case 'distance & time':
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].distance} ${day.exercises[i].unitLength} in ${day.exercises[i].time} ${day.exercises[i].unitTime}<br />
                `);
                break;

            case 'reps':
                if (!(day.exercises[i].reps)) {
                    break;
                };
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].reps}<br />
                `);
                break;

            case 'distance':
                if (!(day.exercises[i].distance)) {
                    break;
                };
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].distance} ${day.exercises[i].unitLength}<br />
                `);
                break;
            case 'time':
                if (!(day.exercises[i].time)) {
                    break;
                };
                $(`.${day.exercises[i].exercise._id}`).append(`
                    ${day.exercises[i].time} ${day.exercises[i].unitTime}<br />
                `);
                break;
        }

        if (day.exercises[i].comments) {
            $(`.${day.exercises[i].exercise._id}`).append(`
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
    console.log('schedule: ', schedule)
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
    console.log('exercisesArray: ', exercisesArray)
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
toggleProgramDisplay();
hideProgram();
