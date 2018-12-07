var MOCK_PROFILE_DATA = {
    id: 111111,
    firstName: "Alexis",
    lastName: "Louie",
    userName: "alouie1020",
    programs: [
        // only displays Program's Name & Author 
        {
            id: 1230984921,
            name: "7 Days of Dumbbells",
            author: "alouie1020",
            publishedAt: 1470009976609
        },
        {
            id: 4329032,
            name: "Back and Biceps",
            author: "alouie1020",
            publishedAt: 1470009976611
        },
    ],
    savedPrograms: [
        {
            id: 3908141,
            name: "Beginner Boxing",
            author: "MT445",
            publishedAt: 1470009976612
        },
        {
            id: 43928910,
            name: "Kizen Free 4-wk Trial",
            author: "bkwan23",
            publishedAt: 1470009976613
        },
    ]
}

function getProfileData(callback) {
    setTimeout(function () { callback(MOCK_PROFILE_DATA) }, 100);
}

function displayProfileData(data) {
    $('body').prepend(`
        <h1>Welcome Back ${data.userName}!</h1>
    `);
    $('.js-user-programs').prepend('<p>Your Programs:</p>');
    for (program of data.programs) {
        $('.js-user-programs').append(`
        <li>
            ${program.name} by ${program.author}
            <button class="js-show-program">show</button>
        </li>
        `)
    }
    $('.js-saved-programs').append(`
        <p>Your Saved Programs:</p>
    `);
    for (program of data.savedPrograms) {
        $('.js-saved-programs').append(`
            <li>
                ${program.name} by ${program.author}
                <button class="js-show-program">show</button>
            </li>
        `)
    }   
}

function showProgram() {
    $('main').on('click', '.js-show-program', function(event) {
        event.preventDefault();
    })
}

function addProgram() {
    $('main').on('click', '.js-add-button', function (event) {
        event.preventDefault();
        $('.js-add-button').prop('hidden', true);
        $('.js-user-programs').prop('hidden', true);
        $('.js-saved-programs').prop('hidden', true);
        $('.js-add-programs').append(`
            <form class="js-form">
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
    $('.js-form').on('click', '.js-add-progLength', function (event) {
        event.preventDefault();
        $('.js-add-progLength').prop('hidden', true);
        const programLength = $('.programLength').val();
        $('.js-form').append(`
            <br />
            <br />
            Schedule:
        `);

        if (programLength == 1) {
            $('.js-form').append(`
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
                $('.js-form').append(`
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
        $('form').append(`
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
    $('.js-form').on('click', '.js-add-exercise', function(event){
        event.preventDefault();
        $('.exercises').append(newProgram);
    });
    $('.js-form').on('click', '.js-add-prog-exercise', function(event){
        event.preventDefault();
        $(this).before(newProgram);
    });
}

function removeExercise(){
    $('.js-form').on('click', '.js-remove-exercise', function(event){
        event.preventDefault();
        $(this).parent().remove();
    });
}

function getAndDisplayProfileData() {
    getProfileData(displayProfileData);
}

$(function () {
    getAndDisplayProfileData();
})

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
showProgram();