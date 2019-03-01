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

function addProgLength() {
    $('body').on('click', '.js-add-progLength', function (event) {
        event.preventDefault();
        $('.js-add-program-length').hide();
        const dayCount = $('.programLength').val();
        $('.js-add-program-form').append(`
            <br />
            <br />
            Schedule:
        `);

        let html = ''
        for (let i = 0; i < dayCount; i++) {
            html += dayCount > 1 ? renderMultiDay(i + 1) : renderSingleDay()
        }
        $('.js-add-program-form').append(html);

        function renderSingleDay() {
            return `
            <div class="day">
                <div class="exercises">
                    <button class="js-add-exercise">Add Exercise</button>
                </div>
            </div>
          `
        }

        function renderMultiDay(day) {
            return `
            <fieldset>
              <legend>Day ${day}</legend>
              <div class="day">
                  <label for="name">Name:</label>
                  <input type="text" class="name" placeholder="e.g. Day 1: Legs" required>
                  <br />
                  <div class="exercises">
                      <button class="js-add-exercise multiday">Add Exercise</button>
                  </div>
              </div>
            </fieldset>
          `
        }

        $('.js-add-program-form').append(`
            <br />
            <button type=submit class="js-save-program">Save Program</button>
        `)

        addExercise();
        $('.js-add-exercise').trigger('click');

        removeExercise();
    })
}

function addExercise() {
    let count = 0;

    function newExercise() {
        return `
        <div class="exercise">
            <label>Exercise Name:</label>
            <input type="text" class="exercise-name" id="exercise-${++count}" required>
            <br /> 

            <label>Exercise Type:</label>
            <select name="exercise-type" class="exercise-type" required>
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
    }

    $('body').on('click', '.js-add-exercise', function (event) {
        event.preventDefault();
        const newHtml = newExercise()
        const inputId = $(newHtml).find('input').attr('id')

        $(this).before(newHtml);

        const exerciseOptions = {
            url: '/exercises/list',
            getValue: function (element) {
                return element.name;
            },
            ajaxSettings: {
                dataType: "json",
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${bearer}`
                },
                data: {
                    dataType: "json",
                },
                contentType: "application/json"
            },
            preparePostData: function (data) {
                data.name = $(`#${inputId}`).val().trim();
                return JSON.stringify(data);
            },
            requestDelay: 300,
            list: {
                onChooseEvent: function () {
                    const value = $(`#${inputId}`).getSelectedItemData()._id;
                    $(`#${inputId}`).attr('data-exercise-id', value);
                }
            }
        };

        $(`#${inputId}`).easyAutocomplete(exerciseOptions)
        $(`#${inputId}`).on('blur', function (event) {
            const exerciseName = $(`#${inputId}`).val().trim();
            if (!exerciseName.length) {
                $(`#${inputId}`).val('');
            }
            fetch('http://localhost:8080/exercises',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                },
                body: JSON.stringify({ 'name': exerciseName })
            })
            .then(data => data.json())
            .then(console.log)
        })
    });
    
}

function removeExercise() {
    $('.js-add-program-form').on('click', '.js-remove-exercise', function (event) {
        event.preventDefault();
        $(this).parent().remove();
    });
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
        <input type="number" min="0" max="100" class="sets" required><br /> 

        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps" required><br />
    `
}

function getRepsTime() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps" required><br /> 

        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time" required>

        <select name="unitTime" class="unitTime" required>
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select><br /> 
    `
}

function getRepsDistance() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps" required><br /> 

        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance" required>

        <select name="unitLength" class="unitLength" required>
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select><br /> 
    `
}

function getDistanceTime() {
    return `<br />
        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance" required>

        <select name="unitLength" class="unitLength" required>
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select><br /> 

        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time" required>

        <select name="unitTime" class="unitTime" required>
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select><br /> 
    `
}

function getReps() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps" required><br /> 
    `
}

function getDistance() {
    return `<br />
        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance" required>

        <select name="unitLength" class="unitLength" required>
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select><br /> 
    `
}

function getTime() {
    return `<br />
        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time" required>

        <select name="unitTime" class="unitTime" required>
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select><br /> 
    `
}

function createProgramObj() {
    $('main').on('click', '.js-save-program', function (event) {
        event.preventDefault();

        const programObj = {};
        programObj['programName'] = $('.programName').val();
        programObj['categories'] = $('.categories').val();
        programObj['schedule'] = createSchedule();

        console.log('programObj: ', programObj)
        // runValidation(programObj);
        // saveProgram(programObj);
    })
}

function createSchedule() {
    const schedule = [];
    $('.day').each(function (index, day) {
        const dayObj = {};
        if ($('div').hasClass('name')) {
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
        let exerciseId = $(exercise).find('div > .exercise-name').data('exercise-id');
        const name = $(exercise).find('div > .exercise-name').first().val();
        const type = $(exercise).find('.exercise-type').first().val();
        const descriptors = type.split('-');
        const comments = $(exercise).find('.comments').first().val();

        if (descriptors.includes('time')) {
            const unitTime = $(exercise).find('.unitTime').first().val();
            exerciseObj['unitTime'] = unitTime;
        }
        if (descriptors.includes('distance')) {
            const unitLength = $(exercise).find('.unitLength').first().val();
            exerciseObj['unitLength'] = unitLength;
        }

        exerciseObj['name'] = name;
        exerciseObj['exercise'] = exerciseId;
        exerciseObj['type'] = type;

        exerciseObj[`${descriptors[0]}`] = $(exercise).find(`.${descriptors[0]}`).first().val();
        if (descriptors[1]) {
            exerciseObj[`${descriptors[1]}`] = $(exercise).find(`.${descriptors[1]}`).first().val();
        }
        exerciseObj['comments'] = comments;

        console.log('exerciseObj: ', exerciseObj)

        exercisesArray.push(exerciseObj);
    });

    return exercisesArray;
}

function runValidation(program) {
    console.log(program.schedule)
    if (!exerciseObj.exercise) {
        const name = $(exercise).find('div > .exercise-name').first().val();
        fetch(`http://localhost:8080/exercises?name=${name}`,
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
            .then(exercise => {
                console.log('exercise ', exercise)
                if (exercise.length > 0) {
                    exerciseObj['exercise'] = exercise[0].id;
                }
                else {
                    fetch(`/exercises`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${bearer}`
                            },
                            body: JSON.stringify({ 'name': name })
                        })
                        .then(res => {
                            if (res.ok) {
                                return res.json()
                            }
                            else {
                                throw Error(`Request rejected with status ${res.status}`);
                            }
                        })
                        .then(exercise => {
                            exerciseObj['exercise'] = exercise.id;
                            console.log(exercise)
                        })
                }
            })

        // fetch(`/exercises`,
        //     {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${bearer}`
        //         },
        //         body: JSON.stringify({ 'name': name })
        //     })
        //     .then(res => {
        //         if (res.ok) {
        //             return res.json()
        //         }
        //         else {
        //             throw Error(`Request rejected with status ${res.status}`);
        //         }
        //     })
        //     .then(exercise => {
        //         exerciseObj['exercise'] = exercise.id;
        //     })
    }
}

// function saveProgram(program) {

// fetch(`/programs/`,
//     {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${bearer}`
//         }, 
//         body: JSON.stringify(program)
//     })
//     .then(res => {
//         if (res.ok) {
//             return window.location.replace('/profile.html');
//         }
//         else {
//             throw Error(`Request rejected with status ${res.status}`);
//         }
//     })
// }

addProgLength();
createProgramObj();