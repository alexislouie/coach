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
                <div id="${program._id}">
                    ${program.programName}
                    <button class="js-show-program js-show-program-${program._id}" id="${program._id}">show</button>
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
                        <div id="${data.id}">
                            ${data.programName} by ${data.author}
                            <button class="js-show-program js-show-program-${data.id}" id="${data.id}">show</button>
                        </div>`
                    );
                })
        })
    }
}

function handleSubmit() {
    $('main').on('click', '.js-save-program', function (event) {
        event.preventDefault();

        fetch('http://localhost:8080/users',
            {
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
            .then(res => {
                console.log(res);
            })
    })
}

function hideProgram() {
    $('main').on('click', '.js-hide-program', function (event) {
        event.preventDefault();
        console.log(click)
        $(this).prop('hidden', true);
        $(`#${this.id}-details`).html('');
        $(`.js-show-button-${this.id}`).prop('hidden', false);
        // $(`#${this.id}`).append('<button class="js-show-button">show</button>');
    })
}

function displayUserProgram() {
    $('main').on('click', '.js-show-program', function (event) {
        event.preventDefault();
        $(this).prop('hidden', true);
        $(`#${this.id}`).append(`<button class="js-hide-button js-hide-button-${this.id}" id="${this.id}">hide</button>`)

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

                $(`#${this.id}`).append(`
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
    // run a bunch of if statements for each rep, set, unit, etc?
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
handleSubmit();





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
                <select multiple>
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
                <div class="exercises">
                    <div class="exercise">
                        <label for="exercise-name">Exercise Name:</label>
                        <input type="text" class="exercise-name">
                        <br /> 

                        <label for="sets">Sets:</label>
                        <input type="number" min="0" max="100" class="sets">
                        <br /> 

                        <label for="reps">Reps:</label>
                        <input type="number" min="0" class="reps">
                        <br /> 

                        <label for="dist">Distance:</label>
                        <input type="number" min="0" class="distance">

                        <label for="unitLength">Unit of Length:</label>
                        <select name="unitLength" class="unitLength">
                            <option value="meter">m</option>
                            <option value="kilometer">km</option>
                            <option value="feet">ft</option>
                            <option value="mile">mi</option>
                        </select>
                        <br /> 

                        <label for="time">Time:</label>
                        <input type="number" class="time">

                        <label for="unitTime">Unit of Time:</label>
                        <select name="unitTime">
                            <option value="minute">m</option>
                            <option value="hour">hr</option>
                            <option value="second">s</option>
                        </select>
                        <br /> 

                        <label for="comments">Comments:</label>
                        <input type="text" class="comments">


                        <br />
                        <button class="js-remove-exercise">Remove this Exercise</button>
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

function addExercise() {
    const newProgram = `
        <div class="exercise">
            <label for="exercise-name">Exercise Name:</label>
            <input type="text" class="exercise-name">
            <br /> 

            <label for="sets">Sets:</label>
            <input type="number" min="0" max="100" class="sets">
            <br /> 

            <label for="reps">Reps:</label>
            <input type="number" min="0" class="reps">
            <br /> 

            <label for="dist">Distance:</label>
            <input type="number" min="0" class="distance">

            <label for="unitLength">Unit of Length:</label>
            <select name="unitLength" class="unitLength">
                <option value="meter">m</option>
                <option value="kilometer">km</option>
                <option value="feet">ft</option>
                <option value="mile">mi</option>
            </select>
            <br /> 

            <label for="time">Time:</label>
            <input type="number" class="time">

            <label for="unitTime">Unit of Time:</label>
            <select name="unitTime">
                <option value="minute">m</option>
                <option value="hour">hr</option>
                <option value="second">s</option>
            </select>
            <br /> 

            <label for="comments">Comments:</label>
            <input type="text" class="comments">


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

// function getAndDisplayProfileData() {
//     getProfileData(displayProfileData);
// }

function handleSubmitButton() {
    // CONFIRM THAT Exercise Name IS INCLUDED 
}

// $(function () {
//     getAndDisplayProfileData();
// })

// For when searching for programs
// const MOCK_PROGRAM_DATA = [
//     {
//         id: 1230984921,
//         programName: "7 Days of Dumbbells",
//         author: "alouie1020",
//         length: 7,
//         publishedAt: 1470009976609,
//         schedule: [
//             {
//                 name: "Day 1: Legs & Glutes",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 2: Back & Triceps",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 3: Stretch It Out",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 4: Upper Body Cardio",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 5: Full Body HIIT",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 6: Mobility Work",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             },
//             {
//                 name: "Day 7: Cardio & Core",
//                 exercises: 
//                     [ 
//                         {
//                             name: "SS DB sumo pulse squat",
//                             sets: 3,
//                             reps: 12,
//                         },
//                         {
//                             name: "DB glute thrust pulses x 60s",
//                             sets: 3,
//                             time: 60,
//                             unitTime: "s"
//                         },
//                         {
//                             name: "SS Stationary lunges",
//                             sets: 3,
//                             reps: 12,
//                             comments: "*Perform both exercises with the same leg, then switch*"
//                         },
//                         {
//                             name: "SL hip thrust + banded knee pull",
//                             sets: 3, 
//                             reps: 12,
//                             comments: "*band is optional*"
//                         },
//                         {
//                             name: "Circuit: Weighted side to side lateral lunge",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "Circuit: 35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "DB Romanian deadlifts",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         },
//                         {
//                             name: "Lateral to squat jumps",
//                             sets: 3,
//                             time: 35,
//                             unitTime: "s",
//                             comments: "35 seconds work / 15 seconds rest"
//                         }
//                     ]
//             }
//         ]
//     },
//     {
//         id: 1230984922,
//         programName: "Beginner Leg Day",
//         author: "alouie1020",
//         length: 1,
//         publishedAt: 1470009975700,
//         schedule: [
//             {
//                 exercises: [ 
//                     {
//                         name: "Barbell Squat",
//                         sets: 4,
//                         reps: 12,
//                         comments: "Begin with lighter weight, increase incrementally"
//                     },
//                     {
//                         name: "Sumo Deadlift",
//                         sets: 4, 
//                         reps: 12
//                     },
//                     {
//                         name: "Glute Bridge",
//                         sets: 4, 
//                         reps: 20
//                     },
//                     {
//                         name: "SL Romanian Deadlift",
//                         sets: 4, 
//                         reps: 15
//                     }
//                 ]
//             }
//         ]
//     }
// ]

// function getProgramData(callback) {
//     setTimeout(function() { callback(MOCK_PROGRAM_DATA)}, 100);
// }

// function displayProgramData(data) {
//     for (program of data) {
//         const { programName, author, schedule } = program;
//         $('body').append(`
//             <h2>${programName}</h2>
//             by ${author}
//         `);
//         for (day of schedule) {
//             const { exercises } = day;
//             // if it's a single workout (i.e. not an entire program), this wont exist
//             if (day.name) {
//                 $('body').append(`
//                     <h3>${day.name}</h3>
//                 `);
//             }
//             for (exercise of exercises) {
//                 for (const prop in exercise) {
//                     if (prop === "name") {
//                         $('body').append(
//                             `<br />
//                             <b>Exercise</b>: ${exercise[prop]}`
//                         )
//                     } else {
//                         $('body').append(
//                             `<li>${prop}: ${exercise[prop]}</li>`
//                         )
//                     }
//                 }
//             }
//         }
//     }
// }

// function getAndDisplayProgramData() {
//     getProgramData(displayProgramData);
// }

// $(function() {
//     getAndDisplayProgramData();
// })

$(addProgram);
displayUserProgram();
hideProgram();