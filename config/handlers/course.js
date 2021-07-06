const Course = require('../../models/Course');
const User = require('../../models/User');

async function loadHomePage(req, res) {
    const isLoggedIn = req.isLoggedIn;
    const courses = await Course.find().lean();
    let publicCourses = courses.filter((course) => course.isPublic === true);
    if (isLoggedIn) {
        publicCourses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        return res.render('home-pages/user-home.hbs', {
            isLoggedIn,
            ...req.user,
            courses: publicCourses
        })
    }
    publicCourses.sort((a, b) => {
        return (a.usersEnrolled.length < b.usersEnrolled.length) ? 1 : -1
    });
    const topThree = publicCourses.slice(0, 3);
    res.render('home-pages/guest-home.hbs', {
        isLoggedIn,
        courses: topThree
    })
}

function loadCreateCoursePage(req, res) {
    res.render('course-pages/create-course.hbs', {
        isLoggedIn: req.isLoggedIn,
        ...req.user
    })
}
async function createCourseHandler(req, res) {
    const { title, description, imageUrl, courseStatus } = req.body;
    if (!title) {
        return invalidData('Title can not be empty!');
    } else if (!description) {
        return invalidData('Description can not be empty!');
    } else if (!imageUrl) {
        return invalidData('Image Url can not be empty!');
    } else if (description.length > 50) {
        return invalidData('Description can not be more than 50 characters!');
    }
    const isPublic = courseStatus === 'on' ? true : false;
    const alreadyCreated = await Course.findOne({ title });
    if (alreadyCreated) {
        return invalidData(`${title} is already created!`);
    }
    const createdAt = new Date().toString().slice(4, 21);
    const creator = req.user._id;
    const course = new Course({
        title,
        description,
        imageUrl,
        isPublic,
        createdAt,
        creator
    });
    const status = await course.save();
    if (status) {
        console.log('New course created successfully');
    }
    return res.redirect('/');

    function invalidData(errMessage) {
        return res.render('course-pages/create-course.hbs', {
            isLoggedIn: req.isLoggedIn,
            ...req.user,
            errMessage,
            title,
            description,
            imageUrl
        })
    }
}
async function loadCourseDetails(req, res) {
    const userId = req.user._id;
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    const creator = course.creator.toString();
    const enrolledUsers = course.usersEnrolled.toString();
    let isCreator = false;
    if (creator === userId) {
        isCreator = true;
    }
    let isEnrolled = false;
    if (enrolledUsers.includes(userId)) {
        isEnrolled = true;
    }

    res.render('course-pages/course-details.hbs', {
        isLoggedIn: req.isLoggedIn,
        ...req.user,
        course,
        isCreator,
        isEnrolled
    })
}
async function enrollUser(req, res) {
    const userId = req.user._id;
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    const enrolledUsers = course.usersEnrolled.toString();
    if (enrolledUsers.includes(userId)) {
        return res.redirect(`/course/${id}`);
    }
    await Course.update({ _id: id }, { $push: { usersEnrolled: userId } });
    await User.update({ _id: userId }, { $push: { enrolledCourses: id } });

    res.redirect(`/course/${id}`);
}
async function deleteCourse(req, res) {
    const { id } = req.params;
    await Course.deleteOne({ _id: id });
    console.log("Successful deletion");
    res.redirect('/');
}
async function loadEditPage(req, res) {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    console.log(course)
    res.render('course-pages/edit-course.hbs', {
        isLoggedIn: req.isLoggedIn,
        ...req.user,
        course,
    })
}
async function editCourse(req, res) {
    const { title, description, imageUrl, courseStatus } = req.body;
    const { id } = req.params;
    const course = { title, description, imageUrl, _id: id };
    if (!title) {
        return invalidData('Title can not be empty!');
    } else if (!description) {
        return invalidData('Description can not be empty!');
    } else if (!imageUrl) {
        return invalidData('Image Url can not be empty!');
    } else if (description.length > 50) {
        return invalidData('Description can not be more than 50 characters!');
    }
    const isPublic = courseStatus === 'on' ? true : false;
    await Course.findOneAndUpdate({ _id: id }, {
        title,
        description,
        imageUrl,
        isPublic
    })
    res.redirect(`/course/${id}`)

    function invalidData(errMessage) {
        return res.render('course-pages/edit-course.hbs', {
            isLoggedIn: req.isLoggedIn,
            ...req.user,
            errMessage,
            course
        })
    }

}
async function serachHandler(req, res) {
    const isLoggedIn = req.isLoggedIn;
    const search = req.query.search
    const courses = await Course.find().lean();
    const filtered = courses.filter(course => course.title.toLowerCase().includes(search.toLowerCase()));
    return res.render('home-pages/user-home.hbs', {
        isLoggedIn,
        ...req.user,
        courses: filtered
    })
}

module.exports = {
    loadHomePage,
    loadCreateCoursePage,
    createCourseHandler,
    loadCourseDetails,
    enrollUser,
    deleteCourse,
    loadEditPage,
    editCourse,
    serachHandler
}