import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss']
})
export class CareersComponent implements OnInit {
  selectedRole: string = '';
  experienceFilter: string = '';

  roles = [
    {
      title: 'Frontend Developer',
      type: 'Full Time',
      experience: '2-5 years',
      level: 'Mid-Level',
      location: 'Mumbai',
      description: 'We are looking for a Frontend Developer with strong Angular/React skills to join our team.',
      requirements: [
        'Proficiency in Angular/React and TypeScript',
        'Experience with responsive web design',
        'Knowledge of modern CSS frameworks',
        'Understanding of RESTful APIs'
      ]
    },
    {
      title: 'Backend Developer',
      type: 'Full Time',
      experience: '2-5 years',
      level: 'Mid-Level',
      location: 'Mumbai',
      description: 'Seeking a Backend Developer with Node.js and MongoDB experience to build scalable solutions.',
      requirements: [
        'Strong experience with Node.js and Express',
        'Database design and optimization skills',
        'API development and integration',
        'Cloud platform experience (AWS/GCP)'
      ]
    },
    {
      title: 'UI/UX Designer',
      type: 'Full Time',
      experience: '1-3 years',
      level: 'Junior',
      location: 'Mumbai',
      description: 'Looking for a creative UI/UX Designer to create beautiful and intuitive user experiences.',
      requirements: [
        'Proficiency in Figma, Sketch, or Adobe XD',
        'Understanding of user-centered design principles',
        'Experience with prototyping and wireframing',
        'Portfolio showcasing design projects'
      ]
    },
    {
      title: 'Digital Marketing Specialist',
      type: 'Full Time',
      experience: '2-4 years',
      level: 'Mid-Level',
      location: 'Mumbai',
      description: 'Join us as a Digital Marketing Specialist to drive our online presence and growth.',
      requirements: [
        'Experience with Google Ads and Facebook Marketing',
        'SEO and content marketing expertise',
        'Analytics and data-driven decision making',
        'Social media management skills'
      ]
    },
    {
      title: 'Business Development Executive',
      type: 'Full Time',
      experience: '1-3 years',
      level: 'Junior',
      location: 'Mumbai',
      description: 'We need an energetic Business Development Executive to expand our market presence.',
      requirements: [
        'Strong communication and negotiation skills',
        'Experience in B2B sales or partnerships',
        'Market research and analysis capabilities',
        'CRM software proficiency'
      ]
    },
    {
      title: 'Senior Full Stack Developer',
      type: 'Full Time',
      experience: '5-8 years',
      level: 'Senior',
      location: 'Mumbai',
      description: 'Lead our development team as a Senior Full Stack Developer with expertise in modern technologies.',
      requirements: [
        'Expert-level knowledge of JavaScript ecosystem',
        'Leadership and mentoring experience',
        'System architecture and design skills',
        'DevOps and deployment experience'
      ]
    },
    {
      title: 'Product Manager',
      type: 'Full Time',
      experience: '3-6 years',
      level: 'Senior',
      location: 'Mumbai',
      description: 'Drive product strategy and roadmap as our Product Manager in the events tech space.',
      requirements: [
        'Product management experience in tech companies',
        'Strong analytical and strategic thinking',
        'User research and market analysis skills',
        'Cross-functional team collaboration'
      ]
    }
  ];

  internships = [
    {
      title: 'Frontend Development Intern',
      duration: '3-6 months',
      type: 'Remote/Hybrid',
      stipend: 'Paid',
      description: 'Learn modern web development with hands-on projects using Angular, React, and modern CSS frameworks.',
      skills: ['HTML/CSS', 'JavaScript', 'Basic Angular/React', 'Git']
    },
    {
      title: 'Backend Development Intern',
      duration: '3-6 months',
      type: 'Remote/Hybrid',
      stipend: 'Paid',
      description: 'Work with our backend team to build APIs and database solutions using Node.js and MongoDB.',
      skills: ['JavaScript', 'Node.js Basics', 'Database Concepts', 'API Understanding']
    },
    {
      title: 'UI/UX Design Intern',
      duration: '2-4 months',
      type: 'Remote/Hybrid',
      stipend: 'Paid',
      description: 'Create user interfaces and experiences for our platform while learning industry best practices.',
      skills: ['Design Tools (Figma/Sketch)', 'Creative Thinking', 'User Research', 'Prototyping']
    },
    {
      title: 'Digital Marketing Intern',
      duration: '3-6 months',
      type: 'Remote/Hybrid',
      stipend: 'Paid',
      description: 'Support our marketing team with social media, content creation, and digital campaigns.',
      skills: ['Social Media', 'Content Writing', 'Basic Analytics', 'Communication']
    },
    {
      title: 'Business Development Intern',
      duration: '3-4 months',
      type: 'Hybrid',
      stipend: 'Paid',
      description: 'Assist in market research, lead generation, and partnership development activities.',
      skills: ['Communication', 'Research Skills', 'Basic Sales', 'Excel/Sheets']
    },
    {
      title: 'Data Analytics Intern',
      duration: '4-6 months',
      type: 'Remote/Hybrid',
      stipend: 'Paid',
      description: 'Work with our data team to analyze user behavior and generate insights for business decisions.',
      skills: ['Excel/Google Sheets', 'Basic SQL', 'Data Visualization', 'Analytical Thinking']
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  selectRole(role: string) {
    this.selectedRole = role;
    // Scroll to the form section
    setTimeout(() => {
      document.getElementById('applicationForm')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  clearSelection() {
    this.selectedRole = '';
    // Scroll back to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setExperienceFilter(filter: string) {
    this.experienceFilter = filter;
    // Scroll to positions section after content loads
    setTimeout(() => {
      const element = filter === 'fresher' ? 
        document.querySelector('.internship-section') : 
        document.querySelector('.positions-section');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }

  clearExperienceFilter() {
    this.experienceFilter = '';
    // Scroll back to experience selection
    setTimeout(() => {
      document.querySelector('.experience-selection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  getFilteredRoles() {
    if (this.experienceFilter === 'professional') {
      return this.roles.filter(role => role.level === 'Senior' || role.experience.includes('5') || role.experience.includes('8'));
    }
    if (this.experienceFilter === 'fresher') {
      return this.roles.filter(role => role.level === 'Junior' || role.experience.includes('1-3'));
    }
    return this.roles;
  }
}
