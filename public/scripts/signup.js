const bearer = localStorage.getItem('authToken');
const id = localStorage.getItem('userId');

function handleSignUp() {
    $('body').on('click', '.js-signup-button', function (event) {
        event.preventDefault();
        $('.errors').remove();

        const regUser = {};
        let alertArr = []

        const userName = $('#reg-userName').val();
        if (!userName || userName.trim().length < 3 || userName.trim().length > 20) {
            alertArr.push('valid username (min 3 characters, max 20)');
        } else {
            // fetch(`http://localhost:8080/users?userName=${userName}`,
            //     { method: 'GET' })
            //     .then(res => {
            //         if (res.ok) {
            //             return res.json();
            //         }
            //         else {
            //             throw Error(`Request rejected with status ${res.status}`);
            //         }
            //     })
            //     .then(data => {
            //         if (data.length === 0) {
            //             regUser['userName'] = userName;
            //         } 
            //         else if (data.length > 0) {
            //             $('.errors').append(`<li>unique username</li>`)
            //         }
            //     })
            regUser['userName'] = userName;
        }

        const firstName = $('#reg-firstName').val();
        if (!firstName || firstName.trim().length === 0) {
            alertArr.push('valid first name');
        } else {
            regUser['firstName'] = firstName;
        }

        const lastName = $('#reg-lastName').val();
        if (!lastName || lastName.trim().length === 0) {
            alertArr.push('valid last name');
        } else {
            regUser['lastName'] = lastName;
        }

        const password = $('#reg-password').val();
        if (!password || password.trim().length < 3 || password.trim().length > 72) {
            alertArr.push('valid password (min 8 characters, max 72)');
        } else {
            regUser['password'] = password;
        }

        if (alertArr.length > 0) {
            $('.form-header').after(`<div class="errors">Please include the following details:</div>`)
            alertArr.forEach(a => {
                $('.errors').append(`<li>${a}</li>`)
            })
        }
        else {
            createUser(regUser);
        }
    });

}

function createUser(info) {
    fetch('http://localhost:8080/users/register',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(info)
        })
        .then(res => {
            if (res.ok) {
                return res.json()
            }
            else {
                throw Error(`Request rejected with status ${res.status}`);
            }
        })
        .then(res => {
            return window.location.replace('/login.html');
        })
}

handleSignUp();