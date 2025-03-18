const { faker } = require("@faker-js/faker");
const fs = require("fs");

function generateStudents(num) {
  const students = [];
  const competitionCategories = ["Hackathon", "Debate", "Quiz", "Project"];
  const skillsByCategory = {
    Hackathon: [
      "JavaScript",
      "Python",
      "Machine Learning",
      "Blockchain",
      "Cybersecurity",
    ],
    Debate: [
      "Public Speaking",
      "Critical Thinking",
      "Persuasion",
      "Political Awareness",
      "Logic",
    ],
    Quiz: [
      "General Knowledge",
      "History",
      "Science",
      "Mathematics",
      "Literature",
    ],
    Project: [
      "Software Development",
      "Embedded Systems",
      "Data Analysis",
      "Cloud Computing",
      "Game Development",
    ],
  };

  for (let i = 0; i < num; i++) {
    let category = faker.helpers.arrayElement(competitionCategories);
    let skills = faker.helpers.arrayElements(skillsByCategory[category], 3);

    students.push({
      firebaseUID: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      profile_picture: faker.image.avatar(),
      location: {
        city: faker.location.city(),
        country: faker.location.country(),
      },
      education: {
        institution: faker.company.name(),
        degree: faker.helpers.arrayElement([
          "B.Tech",
          "M.Tech",
          "B.Sc",
          "M.Sc",
          "PhD",
        ]),
        graduation_year: faker.number.int({ min: 2025, max: 2030 }),
      },
      skills: skills,
      interests: [category],
      experience: [
        {
          title: `Experience in ${category}`,
          description: faker.lorem.sentence(),
          date: faker.date.past(),
          type: category,
        },
      ],
      hackathon_prev_experiences: faker.number.int({ min: 0, max: 10 }),
      hackathon_current_interests: faker.helpers.arrayElements(
        competitionCategories,
        2
      ),
      projects: [
        {
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          tech_stack: faker.helpers.arrayElements(
            ["React", "Django", "MongoDB", "TensorFlow", "Node.js"],
            3
          ),
          github_link: faker.internet.url(),
          live_demo: faker.internet.url(),
        },
      ],
      achievements: [
        {
          title: faker.word.words(3),
          description: faker.lorem.sentence(),
          date: faker.date.past(),
        },
      ],
      certifications: faker.helpers.arrayElements(
        ["AWS Certified", "Google Cloud Certified", "Python for Data Science"],
        2
      ),
      social_links: {
        github: faker.internet.url(),
        linkedin: faker.internet.url(),
        portfolio: faker.internet.url(),
      },
      mentorship_interests: {
        seeking_mentor: faker.datatype.boolean(),
        mentor_topics: faker.helpers.arrayElements(
          ["AI", "Web Development", "Public Speaking", "Finance"],
          2
        ),
      },
      preferred_working_hours: {
        start_time: "09:00 AM",
        end_time: "06:00 PM",
      },
      goals: faker.helpers.arrayElements(
        ["Win a Hackathon", "Publish a Research Paper", "Build an AI Model"],
        2
      ),
      rating: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      total_reviews: faker.number.int({ min: 0, max: 50 }),
      teammates: [],
      mentors: [],
    });
  }
  return students;
}

// Generate JSON data
const studentsJSON = generateStudents(100);

// Save to a JSON file
fs.writeFileSync("students.json", JSON.stringify(studentsJSON, null, 2));

console.log("students.json file has been created successfully!");
