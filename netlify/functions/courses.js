// Goal: Kellogg course reviews API!
//
// Business logic:
// - Courses can be taught by more than one lecturer (e.g. Brian Eng's KIEI-451 and Ben Block's KIEI-451)
// - Information on a course includes the course number (KIEI-451) and name (Intro to Software Development)
// - Lecturers can teach more than one course (e.g. Brian Eng teaches KIEI-451 and KIEI-925)
// - Reviews can be written (anonymously) about the lecturer/course combination (what would that be called?)
// - Reviews contain a String body, and a numeric rating from 1-5
// - Keep it simple and ignore things like multiple course offerings and quarters; assume reviews are written
//   about the lecturer/course combination only – also ignore the concept of a "user" and assume reviews
//   are written anonymously
//
// Tasks:
// - (Lab) Think about and write the domain model - fill in the blanks below
// - (Lab) Build the domain model and some sample data using Firebase
// - (Lab) Write an API endpoint, using this lambda function, that accepts a course number and returns 
//   information on the course and who teaches it
// - (Homework) Provide reviews of the lecturer/course combinations 
// - (Homework) As part of the returned API, provide the total number of reviews and the average rating for 
//   BOTH the lecturer/course combination and the course as a whole.

// === Domain model - fill in the blanks ===
// There are 4 models: courses, lecturers, sections, reviews
// There is one many-to-many relationship: courses <-> lecturers, which translates to two one-to-many relationships:
// - One-to-many: courses -> sections
// - One-to-many: lecturers -> sections
// And one more one-to-many: sections -> reviews
// Therefore:
// - The first model, courses, contains the following fields: courseNumber, name
// - The second model, lecturers, contains the following fields: name
// - The third model, sections, contains the following fields: courseId, lecturerId
// - The fourth model, reviews, contains the following fields, sectionId, body, rating

// allows us to use firebase
let firebase = require(`./firebase`)

// /.netlify/functions/courses?courseNumber=KIEI-451
exports.handler = async function(event) {

  // get the course number being requested
  let courseNumber = event.queryStringParameters.courseNumber

  // establish a connection to firebase in memory
  let db = firebase.firestore()

  // ask Firebase for the course that corresponds to the course number, wait for the response
  let courseQuery = await db.collection('courses').where(`courseNumber`, `==`, courseNumber).get()

  // get the first document from the query
  let course = courseQuery.docs[0]

  // get the id from the document
  let courseId = course.id

  // get the data from the document
  let courseData = course.data()

  // create variables for the course info you're going to seek from the database
  let courseRatings=[]


  // create an object with the course data to hold the return value from our lambda
  let returnValue = {
    courseNumber: courseData.courseNumber,
    name: courseData.name,
    courseRatingAverage: [],
    courseReviewsNumber: [],
    sections: []
  }

  // ask Firebase for the sections corresponding to the Document ID of the course, wait for the response
  let sectionsQuery = await db.collection('sections').where(`courseID`, `==`, courseId).get()

  // get the documents from the query
  let sections = sectionsQuery.docs

  // loop through the documents
  for (let i=0; i < sections.length; i++) {
    // get the document ID of the section
    let sectionId = sections[i].id

    // get the data from the section
    let sectionData = sections[i].data()
    
    // create an Object to be added to the return value of our lambda
    let sectionObject = {}

    // ask Firebase for the lecturer with the ID provided by the section; hint: read "Retrieve One Document (when you know the Document ID)" in the reference
    let lecturerQuery = await db.collection('lecturers').doc(sectionData.lecturerID).get()

    // get the data from the returned document
    let lecturer = lecturerQuery.data()

    // add the lecturer's name to the section Object
    sectionObject.lecturerName = lecturer.name

    // 🔥 your code for the reviews/ratings goes here


      // ask Firebase for the reviews corresponding to the Section ID, wait for the response
      let reviewsQuery = await db.collection('reviews').where(`sectionID`, `==`, sectionId).get()

      // get the documents from the query
      let reviews = reviewsQuery.docs

      //add the number of reviews for the section to the section Object
      sectionObject.reviewsNumber = reviews.length

      // add arrays to the section Object for the section's ratings and comments
      sectionObject.comments = []
      let sectionRatings = []

      for(reviewLooper=0; reviewLooper < reviews.length; reviewLooper++){
          // get the data from the section
          let reviewData = reviews[reviewLooper].data()

          // add the comments to the section Object
          sectionObject.comments.push(reviewData.body)

          // enumerate the ratings for the section
          sectionRatings.push(reviewData.rating)

          //enumerate the ratings for the course
          courseRatings.push(reviewData.rating)
      }

      let sectionRatingsSum = 0

      for(sectionRatingsEnumerator=0; sectionRatingsEnumerator < sectionRatings.length; sectionRatingsEnumerator++){
          sectionRatingsSum += sectionRatings[sectionRatingsEnumerator]
      }
    
      let sectionRatingsAverage = sectionRatingsSum / sectionRatings.length

      // add the section Object to the return value
      sectionObject.sectionRatingsAverage = sectionRatingsAverage
      returnValue.sections.push(sectionObject)

  }

  let courseRatingsSum = 0

  for(courseRatingsEnumerator=0; courseRatingsEnumerator < courseRatings.length; courseRatingsEnumerator++){
      courseRatingsSum += courseRatings[courseRatingsEnumerator]
  }

  let courseRatingsAverage = courseRatingsSum / courseRatings.length

  returnValue.courseRatingAverage = courseRatingsAverage
  returnValue.courseReviewsNumber = courseRatings.length



  // return the Object
  return {
    statusCode: 200,
    body: JSON.stringify(returnValue)
  }
}
