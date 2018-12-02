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
    setTimeout(function() { callback(MOCK_PROFILE_DATA)}, 100);
}

function displayProfileData(data) {
    $('body').append(`
        <p>Welcome Back ${data.userName}!</p>
        <p>Your Programs:</p>
    `);
    for (program of data.programs) {
        $('body').append(`
        <li>${program.name} by ${program.author}</li>
        `)
    }
    $('body').append(`
        <p>Your Saved Programs:</p>
    `);
    for (program of data.savedPrograms) {
        $('body').append(`
            <li>${program.name} by ${program.author}</li>
        `)
    }
}

function getAndDisplayProfileData() {
    getProfileData(displayProfileData);
}

$(function() {
    getAndDisplayProfileData();
})

// For when searching for programs
var MOCK_PROGRAM_DATA = [
    {
        id: 1230984921,
        programName: "7 Days of Dumbbells",
        author: "alouie1020",
        length: 7,
        publishedAt: 1470009976609,
        schedule: [
            {
                name: "Day 1: Legs & Glutes",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 2: Back & Triceps",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 3: Stretch It Out",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 4: Upper Body Cardio",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 5: Full Body HIIT",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 6: Mobility Work",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            },
            {
                name: "Day 7: Cardio & Core",
                exercises: 
                    [ 
                        {
                            name: "SS DB sumo pulse squat",
                            sets: 3,
                            reps: 12,
                        },
                        {
                            name: "DB glute thrust pulses x 60s",
                            sets: 3,
                            time: 60,
                            unitTime: "s"
                        },
                        {
                            name: "SS Stationary lunges",
                            sets: 3,
                            reps: 12,
                            comments: "*Perform both exercises with the same leg, then switch*"
                        },
                        {
                            name: "SL hip thrust + banded knee pull",
                            sets: 3, 
                            reps: 12,
                            comments: "*band is optional*"
                        },
                        {
                            name: "Circuit: Weighted side to side lateral lunge",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "Circuit: 35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "DB Romanian deadlifts",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        },
                        {
                            name: "Lateral to squat jumps",
                            sets: 3,
                            time: 35,
                            unitTime: "s",
                            comments: "35 seconds work / 15 seconds rest"
                        }
                    ]
            }
        ]
    },
    {
        id: 1230984922,
        programName: "Beginner Leg Day",
        author: "alouie1020",
        length: 1,
        publishedAt: 1470009975700,
        schedule: [
            {
                exercises: [ 
                    {
                        name: "Barbell Squat",
                        sets: 4,
                        reps: 12,
                        comments: "Begin with lighter weight, increase incrementally"
                    },
                    {
                        name: "Sumo Deadlift",
                        sets: 4, 
                        reps: 12
                    },
                    {
                        name: "Glute Bridge",
                        sets: 4, 
                        reps: 20
                    },
                    {
                        name: "SL Romanian Deadlift",
                        sets: 4, 
                        reps: 15
                    }
                ]
            }
        ]
    }
]

function getProgramData(callback) {
    setTimeout(function() { callback(MOCK_PROGRAM_DATA)}, 100);
}

function displayProgramData(data) {
    for (program of data) {
        const { programName, author, schedule } = program;
        $('body').append(`
            <h2>${programName}</h2>
            by ${author}
        `);
        for (day of schedule) {
            const { exercises } = day;
            // if it's a single workout (i.e. not an entire program), this wont exist
            if (day.name) {
                $('body').append(`
                    <h3>${day.name}</h3>
                `);
            }
            for (exercise of exercises) {
                for (const prop in exercise) {
                    if (prop === "name") {
                        $('body').append(
                            `<br />
                            <b>Exercise</b>: ${exercise[prop]}`
                        )
                    } else {
                        $('body').append(
                            `<li>${prop}: ${exercise[prop]}</li>`
                        )
                    }
                }
            }
        }
    }
}

function getAndDisplayProgramData() {
    getProgramData(displayProgramData);
}

$(function() {
    getAndDisplayProgramData();
})

