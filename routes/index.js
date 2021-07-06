const user = require('../handlers/user');
const course = require('../handlers/course');
const authHandler = require('../utils/authHandler');

module.exports = (app) => {
    app.get('/',
        authHandler.userStatus,
        course.loadHomePage
    );
    app.get('/search',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.serachHandler
    )
    app.get('/course/create',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.loadCreateCoursePage
    );
    app.post('/course/create',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.createCourseHandler
    )
    app.get('/course/:id',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.loadCourseDetails
    )
    app.get('/course/enroll/:id',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.enrollUser
    )
    app.get('/course/delete/:id',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.deleteCourse
    )
    app.get('/edit/:id',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.loadEditPage
    )
    app.post('/edit/:id',
        authHandler.userAutorization,
        authHandler.userStatus,
        course.editCourse
    )


    
    app.get('/login',
        authHandler.guestAutorization,
        authHandler.userStatus,
        user.loadLoginPage
    );
    app.get('/register',
        authHandler.guestAutorization,
        authHandler.userStatus,
        user.loadRegisterPage
    );
    app.post('/login',
        authHandler.guestAutorization,
        authHandler.userStatus,
        user.loginHandler
    );
    app.post('/register',
        authHandler.guestAutorization,
        authHandler.userStatus,
        user.registerHandler
    );
    app.get('/logout',
        user.logoutHandler
    )
}
