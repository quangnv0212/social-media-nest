import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './schemas/question.schema';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    // Ensure each choice has an ID
    const choiceWithIds = createQuestionDto.choice.map((choice) => ({
      ...choice,
      id: choice.id || uuidv4(),
    }));

    const question = await this.questionModel.create({
      ...createQuestionDto,
      choice: choiceWithIds,
    });

    return question.populate('subjectId', 'name');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    type?: string,
    subjectId?: string,
    search?: string,
  ) {
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.questionModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .populate('subjectId', 'name')
        .populate('createdBy', 'name email avatar')
        .exec(),
      this.questionModel.countDocuments(query),
    ]);

    return {
      data: questions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const question = await this.questionModel
      .findById(id)
      .populate('subjectId', 'name')
      .populate('createdBy', 'name email avatar');

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async update(updateQuestionDto: UpdateQuestionDto) {
    // Ensure each new choice has an ID
    if (updateQuestionDto.choice) {
      updateQuestionDto.choice = updateQuestionDto.choice.map((choice) => ({
        ...choice,
        id: choice.id || uuidv4(),
      }));
    }

    const question = await this.questionModel
      .findByIdAndUpdate(updateQuestionDto.id, updateQuestionDto, {
        new: true,
      })
      .populate('subjectId', 'name')
      .populate('createdBy', 'username email');

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async remove(id: string) {
    const question = await this.questionModel.findByIdAndDelete(id);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return { message: 'Question deleted successfully' };
  }

  async seedQuestions(subjectId: string, createdBy: string) {
    const dataLiterature = [
      {
        title: 'Metaphysical Imagery in John Donne',
        description:
          "Analyze the use of metaphysical conceits in John Donne's 'A Valediction: Forbidding Mourning'. How does the compass metaphor develop the poem's theme?",
        answer:
          "In 'A Valediction: Forbidding Mourning', Donne uses the metaphor of a compass to represent the spiritual connection between lovers. The two points of the compass represent the separated lovers - one fixed (the center) and one moving (drawing the circle). Despite physical distance, like the compass points, the lovers remain connected and eventually return together. This metaphysical conceit illustrates the poem's theme of transcendent love that surpasses physical presence.",
        type: 'short_answer',
        choice: [],
      },

      {
        title: 'Gothic Elements in Jane Eyre',
        description:
          "Identify and explain two significant Gothic elements in Charlotte Brontë's 'Jane Eyre'. How do these elements contribute to the novel's atmosphere?",
        answer:
          "Two significant Gothic elements in 'Jane Eyre' are the mysterious attic containing Bertha Mason and the supernatural connection between Jane and Rochester. The hidden madwoman in the attic creates tension and horror, while representing the dark secrets of Thornfield Hall. The telepathic connection between Jane and Rochester at the novel's climax adds a supernatural dimension. These Gothic elements enhance the novel's mysterious atmosphere and explore themes of passion versus reason.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Tragedy in King Lear',
        description:
          "What role does the Fool play in Shakespeare's 'King Lear'? How does his presence contribute to the tragic elements of the play?",
        answer:
          "The Fool in 'King Lear' serves as both comic relief and a truth-teller. Through wit and riddles, he provides honest criticism of Lear's foolish decisions and forewarns of their consequences. His disappearance halfway through the play marks Lear's descent into madness and the transition from political to personal tragedy. The Fool's wisdom ironically highlights Lear's foolishness, deepening the play's tragic impact.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Modernist Techniques in Mrs Dalloway',
        description:
          "Explain how Virginia Woolf uses stream of consciousness in 'Mrs Dalloway'. What does this technique reveal about the characters?",
        answer:
          "Woolf uses stream of consciousness to weave between characters' thoughts and memories, revealing their inner lives and connections. This technique shows how Clarissa Dalloway and Septimus Smith, though never meeting, are linked through their experiences and perceptions. The stream of consciousness reveals their anxieties, memories of the war, and struggles with identity, while demonstrating how a single day contains entire lifetimes of thought and emotion.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Symbolism in The Great Gatsby',
        description:
          "What does the green light symbolize in F. Scott Fitzgerald's 'The Great Gatsby'? How does its meaning evolve throughout the novel?",
        answer:
          "The green light at the end of Daisy's dock symbolizes Gatsby's hopes and dreams, particularly his desire to recapture his past with Daisy. Initially, it represents his specific yearning for Daisy, but it evolves to symbolize the broader American Dream and its ultimate unattainability. By the novel's end, the green light becomes a symbol of the universal human tendency to reach for something forever out of grasp.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Character Development in Great Expectations',
        description:
          "How does Pip's character evolve throughout Charles Dickens' 'Great Expectations'? Discuss key moments that contribute to his development.",
        answer:
          "Pip evolves from an innocent young boy to a snobbish gentleman, and finally to a mature, humble adult. Key moments include his first visit to Satis House, which instills his shame about his common upbringing; his move to London, where his moral corruption accelerates; and Magwitch's return, which forces him to confront his ingratitude and pride. His suffering and loss of fortune ultimately lead to moral growth and true maturity.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Narrative Structure in Wuthering Heights',
        description:
          "Analyze the effect of the nested narrative structure in Emily Brontë's 'Wuthering Heights'. Why might Brontë have chosen this complex narrative approach?",
        answer:
          "The nested narrative structure of 'Wuthering Heights', with Lockwood receiving the story through Nelly Dean, creates multiple layers of perspective and reliability. This structure allows Brontë to create distance between the events and the reader, adding mystery and complexity to the tale. It also raises questions about the reliability of narration and memory, while allowing the story to span multiple generations while maintaining coherence.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Social Commentary in The Importance of Being Earnest',
        description:
          "How does Oscar Wilde use humor and satire to critique Victorian society in 'The Importance of Being Earnest'?",
        answer:
          "Wilde uses wit and epigrams to satirize Victorian upper-class values and institutions. Through characters like Lady Bracknell, he mocks the emphasis on social status and marriage as a business arrangement. The play's treatment of serious institutions (marriage, christening, death) as trivial matters, while treating trivial matters (cucumber sandwiches, names) as serious, reveals the artificiality and hypocrisy of Victorian society.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Power Dynamics in The Tempest',
        description:
          "Examine the relationship between Prospero and Caliban in Shakespeare's 'The Tempest'. What does this relationship reveal about colonialism and power?",
        answer:
          "The relationship between Prospero and Caliban reflects colonial power dynamics, with Prospero as the colonizer who has taken control of Caliban's island. Their relationship evolves from initial cooperation to antagonism, highlighting themes of enslavement, cultural suppression, and resistance. Caliban's claim to the island and his treatment by Prospero raise questions about justice, civilization, and the moral implications of colonialism.",
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Imagery in Poetry Analysis',
        description:
          "Analyze the use of nature imagery in William Wordsworth's 'I Wandered Lonely as a Cloud'. How does this imagery support the poem's themes?",
        answer:
          "Wordsworth uses vivid nature imagery, particularly the daffodils 'fluttering and dancing in the breeze', to explore themes of natural beauty and its lasting impact on the human spirit. The imagery progresses from physical description to memory and emotion, showing how nature provides both immediate joy and lasting spiritual sustenance. This supports the Romantic ideal of nature as a source of emotional and spiritual renewal.",
        type: 'short_answer',
        choice: [],
      },
    ];
    const dataMathematics = [
      {
        title: 'Calculus: Limits and Continuity',
        description: 'Evaluate the limit: lim(x→2) (x² - 4)/(x - 2)',
        answer:
          'The limit as x approaches 2 of (x² - 4)/(x - 2) is 4. This can be found by factoring the numerator: (x+2)(x-2)/(x-2), which simplifies to (x+2) when x≠2. As x approaches 2, the expression approaches 4.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Linear Algebra: Matrix Operations',
        description:
          'Given matrices A = [[1,2],[3,4]] and B = [[5,6],[7,8]], find AB.',
        answer:
          'The matrix multiplication AB results in [[19,22],[43,50]]. This is calculated by: (1×5 + 2×7 = 19), (1×6 + 2×8 = 22), (3×5 + 4×7 = 43), (3×6 + 4×8 = 50).',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Probability Theory',
        description:
          'A bag contains 3 red marbles and 4 blue marbles. What is the probability of drawing two blue marbles in succession without replacement?',
        answer:
          'The probability is (4/7) × (3/6) = 12/42 = 2/7. The first blue marble has a 4/7 probability, and after drawing it, there are 3 blue marbles out of the remaining 6 marbles.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Differential Equations',
        description:
          'Solve the differential equation: dy/dx = 2x with y(0) = 1',
        answer:
          'The solution is y = x² + 1. Integrating dy/dx = 2x gives y = x² + C. Using the initial condition y(0) = 1, we can find that C = 1.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Number Theory',
        description: 'Find all positive integers n where n² - 4n + 3 = 0',
        answer:
          'Using the quadratic formula: n = (-(-4) ± √(16-12))/2 = (4 ± √4)/2 = (4 ± 2)/2. Therefore, n = 3 or n = 1 are the only solutions.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Geometry: Circle Properties',
        description: 'Prove that angles in a semicircle are right angles.',
        answer:
          'Consider a semicircle with center O and diameter AB. For any point C on the semicircle, triangle ACB is inscribed. Angle COB is 180° (diameter). Angles OCA and OCB are equal (radii OC = OA = OB). Therefore, angle ACB must be 90° to make all angles sum to 180°.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Trigonometry: Identities',
        description: 'Prove the identity: sin²θ + cos²θ = 1',
        answer:
          'This fundamental identity can be proven using the Pythagorean theorem in a right triangle where the hypotenuse is 1. The opposite side is sinθ and the adjacent side is cosθ. By the Pythagorean theorem, sin²θ + cos²θ = 1.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Complex Numbers',
        description: 'Find all complex solutions to z³ = 1',
        answer:
          'The solutions are: 1, -1/2 + (√3/2)i, and -1/2 - (√3/2)i. These are the cube roots of unity, spaced equally around the unit circle at angles of 0°, 120°, and 240°.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Vector Analysis',
        description: 'Given vectors a = [1,2,3] and b = [4,5,6], calculate a·b',
        answer:
          'The dot product a·b = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32. This represents the sum of the products of corresponding components.',
        type: 'short_answer',
        choice: [],
      },
      {
        title: 'Series and Sequences',
        description:
          'Find the sum of the infinite geometric series: 1 + 1/2 + 1/4 + 1/8 + ...',
        answer:
          'The sum is 2. This is a geometric series with first term a=1 and ratio r=1/2. Since |r|<1, the sum formula S=a/(1-r) applies: S=1/(1-1/2)=1/(1/2)=2.',
        type: 'short_answer',
        choice: [],
      },
    ];
    dataMathematics.forEach(async (question) => {
      await this.create({
        ...question,
        subjectId: '6790a12f6aa3fc34e58f9087',
        createdBy: createdBy,
      });
    });
  }
}
