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

        const exerciseOptions = {
            url: function(phrase) {
                return '/exercises/list'
            },
            getValue: function(element) {
                return element.name;
            },
            ajaxSettings: {
                dataType: "json",
                method: "POST",
                headers: {
                    'Authorization':`Bearer ${bearer}`
                },
                data: {
                  dataType: "json"
                },
            },
            preparePostData: function(data) {
                data.name = $('.exercise-name').val().trim();
                return data;
            },
            requestDelay: 300
        };
        $('.exercise-name').easyAutocomplete(exerciseOptions);

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
        <input type="number" min="0" max="100" class="sets"><br /> 

        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps"><br />
    `
}

function getRepsTime() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps"><br /> 

        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time">

        <select name="unitTime" class="unitTime">
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select><br /> 
    `
}

function getRepsDistance() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps"><br /> 

        <label for="dist">Distance:</label>
        <input type="number" min="0" class="distance">

        <select name="unitLength" class="unitLength">
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
        <input type="number" min="0" class="distance">

        <select name="unitLength" class="unitLength">
            <option value="m">m</option>
            <option value="km">km</option>
            <option value="ft">ft</option>
            <option value="mi">mi</option>
        </select><br /> 

        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time">

        <select name="unitTime" class="unitTime">
            <option value="min">min</option>
            <option value="hr">hr</option>
            <option value="s">s</option>
        </select><br /> 
    `
}

function getReps() {
    return `<br />
        <label for="reps">Reps:</label>
        <input type="number" min="0" max="999" class="reps"><br /> 
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
        </select><br /> 
    `
}

function getTime() {
    return `<br />
        <label for="time">Time:</label>
        <input type="number" min="0" max="999" class="time">

        <select name="unitTime" class="unitTime">
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
    const newExercise = `
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

    $('body').on('click', '.js-add-exercise', function (event) {
        event.preventDefault();
        $('.exercises').append(newExercise);

    });
    $('.js-add-program-form').on('click', '.js-add-prog-exercise', function (event) {
        event.preventDefault();
        $(this).before(newExercise);
        const exerciseOptions = {
            url: function(phrase) {
                return '/exercises/list'
            },
            getValue: function(element) {
                return element.name;
            },
            ajaxSettings: {
                dataType: "json",
                method: "POST",
                headers: {
                    'Authorization':`Bearer ${bearer}`
                },
                data: {
                  dataType: "json"
                },
            },
            preparePostData: function(data) {
                data.name = $('.exercise-name').val().trim();
                return data;
            },
            requestDelay: 300
        };
        $('.exercise-name').easyAutocomplete(exerciseOptions);
    });
}

function removeExercise() {
    $('.js-add-program-form').on('click', '.js-remove-exercise', function (event) {
        event.preventDefault();
        $(this).parent().remove();
    });
}


$(addProgram);
createProgramObj();