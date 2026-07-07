export const about = {
  name: 'Jo Gurvantamir',
  title: 'Full-Stack Developer',
  location: 'Ottawa, ON',
  paragraphs: [
    "Hi — I'm Jo, a full-stack developer in Ottawa who likes building data-intensive systems end to end, from the database up to the pixels.",
    'Most recently I was a full-stack developer at Ideabytes on the Neology ETBOS highway toll platform — building real-time microservices for traffic-sensor data, event-driven pipelines on ActiveMQ, and enterprise auth with Keycloak/OAuth 2.0. Earlier, as an ML/OCR intern, I trained a custom Tesseract model to read MICR cheque characters, pushing accuracy from 67% to 91%.',
    "I earned a Computer Programming Diploma at Algonquin College (3.9 GPA, Dean's Honour List), took 1st place at Hack the Hill 2023, and co-founded SyberPong, a small game studio, back in Mongolia.",
    'Outside of work I tinker with hackathons, LeetCode, and side projects across AI/ML, cloud, and a bit of hardware.',
  ],
  skills: {
    Languages: ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'SQL', 'Dart'],
    Frameworks: ['Spring Boot', 'React', 'Angular', 'NestJS', 'Node.js', 'Express', 'Flask'],
    'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'Git', 'CI/CD', 'Keycloak'],
    Data: ['PostgreSQL', 'MySQL', 'MongoDB', 'Neo4j', 'Redis'],
  },
} as const;
