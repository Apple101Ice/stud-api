const express = require('express')
const app = express()
const port = process.env.PORT || 2410

app.use(express.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST, DELETE")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
})

app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { studentsData } = require('./studentsData')
const { classes, courses, customers, faculties, students } = studentsData
const maxitemsperpage = 3

app.post("/login", function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const cust = customers.find(c1 => c1.email === email && c1.password === password)
    // console.log(cust);
    const custRec = {
        name: cust.name,
        email: cust.email,
        role: cust.role
    }
    res.send(custRec)
})

app.post("/register", function (req, res) {
    let maxcustid = customers.reduce((acc, curr) => curr.custId > acc ? curr.custId : acc, 0)
    const cust = {
        custId: maxcustid + 1,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    }
    customers.unshift(cust)

    let maxstudid = students.reduce((acc, curr) => curr.id > acc ? curr.id : acc, 0)
    const stud = {
        id: maxstudid + 1,
        name: req.body.name,
        dob: "",
        gender: "",
        about: "",
        courses: []
    }
    students.unshift(stud)
    // console.log(stud);
    const customerRes = {
        name: req.body.name,
        role: req.body.role,
        email: req.body.email
    }
    res.send(customerRes)
})

app.get("/getStudentNames", function (req, res) {
    const studentsList = students.map(s1 => s1.name)
    res.send(studentsList)
})

app.get("/getFacultyNames", function (req, res) {
    const facultyList = faculties.map(f1 => f1.name)
    res.send(facultyList)
})

app.get("/getCourses", function (req, res) {
    res.send(courses)
})

app.put("/putCourse", function (req, res) {
    const course1 = {
        courseId: req.body.courseId,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        faculty: req.body.faculty,
        students: req.body.students
    }
    const index = courses.findIndex(c1 => c1.courseId === course1.courseId)
    courses[index] = course1
    // console.log(course1.students)
    for (let i = 0; i < students.length; i++) {
        let cindex = students[i].courses.indexOf(course1.name)
        let sindex = course1.students.indexOf(students[i].name)

        if (sindex >= 0 && cindex === -1)
            students[i].courses.push(course1.name)
        if (sindex === -1 && cindex >= 0)
            students[i].courses.splice(cindex, 1)
    }

    res.send(course1)
})

app.get("/getStudents", function (req, res) {
    const courseList = req.query.course
    let list = students
    if (courseList?.length)
        list = students.filter(s1 => s1.courses.some(c1 => courseList.includes(c1)))
    const resArr = pagination(list, parseInt(req.query.page))
    res.json({
        page: parseInt(req.query.page),
        items: resArr,
        totalItems: resArr.length,
        totalNum: list.length
    })
})

app.get("/getFaculties", function (req, res) {
    const courseList = req.query.course
    let list = faculties
    if (courseList?.length)
        list = faculties.filter(f1 => f1.courses.some(c1 => courseList.includes(c1)))
    const resArr = pagination(list, parseInt(req.query.page))
    res.json({
        page: parseInt(req.query.page),
        items: resArr,
        totalItems: resArr.length,
        totalNum: list.length
    })
})

app.post("/postStudentDetails", function (req, res) {
    // console.log(req.body);
    let cindex = students.findIndex(s1 => s1.name === req.body.name)
    students[cindex] = { ...students[cindex], ...req.body }
    // console.log(students[cindex]);
    res.send(students[cindex])
})

app.get("/getStudentDetails/:name", function (req, res) {
    const name = req.params.name
    const std1 = students.find(s1 => s1.name === name)
    // console.log(std1)
    res.send(std1)
})

app.get("/getStudentCourse/:name", function (req, res) {
    const name = req.params.name
    const std1 = students.find(s1 => s1.name === name)
    const stdcourses = std1.courses
    const courseDetails = courses.filter(c1 => stdcourses.indexOf(c1.name) >= 0)
    // console.log(courseDetails)
    res.send(courseDetails)
})

app.get("/getStudentClass/:name", function (req, res) {
    const name = req.params.name
    const std1 = students.find(s1 => s1.name === name)
    const stdcourses = std1.courses
    const classDetails = classes.filter(c1 => stdcourses.indexOf(c1.course) >= 0)
    // console.log(classDetails)
    res.send(classDetails)
})

app.get("/getFacultyCourse/:name", function (req, res) {
    const name = req.params.name
    const faculty = faculties.find(f1 => f1.name === name)
    const facultycourses = faculty.courses
    const courseDetails = courses.filter(c1 => facultycourses.indexOf(c1.name) >= 0)
    // console.log(courseDetails)
    res.send(courseDetails)
})

app.get("/getFacultyClass/:name", function (req, res) {
    const name = req.params.name
    const faculty = faculties.find(f1 => f1.name === name)
    const facultycourses = faculty.courses
    const classDetails = classes.filter(c1 => facultycourses.indexOf(c1.course) >= 0)
    // console.log(classDetails)
    res.send(classDetails)
})

app.post("/postClass", function (req, res) {
    // console.log(req.body)
    let maxid = classes.reduce((acc, curr) => curr.classId > acc ? curr.classId : acc, 0)
    const class1 = { classId: maxid + 1, ...req.body }
    // console.log(class1)
    classes.unshift(class1)
    res.send(class1)
})

app.put("/postClass/:classId", function (req, res) {
    let classId = req.params.classId
    let cindex = classes.findIndex(c1 => c1.classId === +classId)
    // console.log(classId, cindex);
    classes[cindex] = { ...classes[cindex], ...req.body };
    // console.log(classes[cindex]);
    res.send(classes[cindex])
})

function pagination(obj, page) {
    return obj.slice(page * maxitemsperpage - maxitemsperpage, page * maxitemsperpage)
}