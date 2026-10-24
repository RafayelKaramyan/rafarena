import { defaultView, type ViewState } from '../domain/match';

export const media = (name: string) => `${import.meta.env.BASE_URL}media/${name}.webp`;

export type Story = {
  slug: string;
  category: 'Perspective' | 'Tactics' | 'Culture';
  title: string;
  shortTitle: string;
  intro: string;
  image: string;
  alt: string;
  caption: string;
  issue: string;
  momentId: string;
  pullquote: string;
  sections: { title: string; paragraphs: string[] }[];
};

export const stories: Story[] = [
  {
    slug: 'the-game-between-the-moments',
    category: 'Perspective',
    title: 'The game between the moments.',
    shortTitle: 'More than the score.',
    intro:
      'A pass is never just a pass. Look away from the ball for a moment. There is a whole other game happening.',
    image: 'hero-football',
    alt: 'Two football players contesting possession on a community pitch',
    caption: 'The action gets your attention. The space around it tells another story.',
    issue: '01',
    momentId: 'between-the-lines',
    pullquote: 'The next good idea might already be moving, just outside the frame.',
    sections: [
      {
        title: 'Start with a different question.',
        paragraphs: [
          'Most of us watch the ball. It gives the game a centre: a place to look, a direction to follow, a reason to react. But it also makes it easy to miss the quiet work around it. A player takes two steps away. A defender follows. For a brief moment, a route appears where there was none.',
          'In our authored “Between the lines” sequence, the interesting question is not whether the final pass arrives. You can see the whole move in ten seconds. The more revealing question is what made that pass available. That question takes you backwards, to the positions before the action.',
        ],
      },
      {
        title: 'Give one player your attention.',
        paragraphs: [
          'Follow number 10, Moreau, for a complete replay. Ignore the temptation to jump to the runner. Notice the pocket he enters, the teammate behind him and the defender between those two positions. Then play the same move again, this time following Solano. The ball has not changed. Your understanding of the move has.',
          'The player-focus control helps hold that thought. It marks a player without hiding the rest of the pitch. Turn the run trails on to compare a starting position with a later one, then turn them off again. An overlay is useful when it answers your question; it does not need to stay on forever.',
        ],
      },
      {
        title: 'An angle is an argument.',
        paragraphs: [
          'The broadcast view puts the move back into a recognisable match shape. Top-down makes the gaps easier to compare. Touchline brings the depth of the run into the picture. None of those views adds another event. Each gives the same event a different emphasis.',
          'Pause just before the release and switch between them. Keep the exact same timestamp. You are comparing perspectives, not two different moments. Save the view that best explains what caught your attention, and give it a name that captures the idea rather than the score.',
        ],
      },
      {
        title: 'Keep the question open.',
        paragraphs: [
          'Rafarena is built around fictional, deliberately authored sequences. These scenes are a small space for looking, pausing and testing an observation. They are not tracking data or a claim about how every real match unfolds.',
          'Take that spirit into your next watch: choose one player, follow a movement without the ball, and give yourself permission to rewind. Sometimes the best part of a familiar game is discovering where you had not been looking.',
        ],
      },
    ],
  },
  {
    slug: 'space-has-a-far-side',
    category: 'Tactics',
    title: 'Space has a far side.',
    shortTitle: 'Change the picture.',
    intro:
      'One side gets crowded. The other gets interesting. A closer look at the switch that changes the shape of a move.',
    image: 'field-aerial',
    alt: 'A football stadium and its playing field photographed from directly above',
    caption:
      'From above, the whole width becomes part of the story. Editorial photograph; an independent venue.',
    issue: '02',
    momentId: 'the-far-side',
    pullquote: 'Do not just follow where the pass goes. Look at what it leaves behind.',
    sections: [
      {
        title: 'Make the frame wider.',
        paragraphs: [
          'A close view can make a patch of the pitch feel like the whole match. Add a second camera angle and the same scene opens up. A cluster of players becomes one part of a larger picture, with a teammate waiting beyond it.',
          'Our “The far side” sequence is an invitation to compare those pictures. Watch it once at broadcast height. Then select top-down, keep the ball path visible and restart. Before following the long pass, find the receiving player on the opposite side.',
        ],
      },
      {
        title: 'Look before the switch.',
        paragraphs: [
          'Pause during the early combination. Count the spaces between the nearest players rather than counting the players themselves. In this authored move, the diagonal pass is one visible action at the end of a short preparation. The earlier positions give that action its context.',
          'Now move the timeline forward in small steps. Compare the receiver’s starting point with the destination of the ball. Turn the player trails on for a second pass through the scene. The two lines describe different jobs: the ball travels across the pitch, while the receiver adjusts to meet it.',
        ],
      },
      {
        title: 'Use the thirds as a reference.',
        paragraphs: [
          'The pitch-thirds layer gives the illustration a few quiet reference areas. It is a guide for your eye, not a measurement of tactical quality. Ask where the move begins, where the switch arrives and which part of the view opens up along the way.',
          'You can keep all the overlays off, too. A clean pitch is often the best way to test whether you can still see the idea you noticed with the guides on. If the answer changes, rewind to the point where it became unclear.',
        ],
      },
      {
        title: 'Save the comparison.',
        paragraphs: [
          'Keep one perspective just before the diagonal and another after the receiver has moved. Name them for what they show: “Before the switch” and “The space beyond the block” are more useful than two unnamed screenshots.',
          'The saved view remembers time, camera, player and layers. A shared link carries that same viewing state, while your private title and observation remain in your browser. The next reader can begin at the exact point you wanted them to see.',
        ],
      },
    ],
  },
  {
    slug: 'the-pitch-is-a-meeting-place',
    category: 'Culture',
    title: 'The pitch is a meeting place.',
    shortTitle: 'It starts anywhere.',
    intro:
      'A painted line. A patch of concrete. Two jackets for goalposts. The places around football are part of what makes it ours.',
    image: 'street-football',
    alt: 'A footballer dribbling along a city street, photographed in black and white',
    caption: 'Different surfaces. A familiar invitation. Independent editorial photography.',
    issue: '03',
    momentId: 'outside-lane',
    pullquote: 'The game is bigger than the ground it is played on.',
    sections: [
      {
        title: 'A familiar set of possibilities.',
        paragraphs: [
          'Before there is a score, there is a place to play. Sometimes it has a stand and a floodlight. Sometimes it has a fence, a wall and a goal that looks a little too small. The setting changes the picture, but the invitation is recognisable.',
          'This is a visual essay about that invitation. The photographs on Rafarena show real football spaces, credited to their photographers. They are not our facilities, our teams or evidence of a community we claim to operate. They bring the everyday texture of the game into an independent editorial project.',
        ],
      },
      {
        title: 'Pay attention to the edges.',
        paragraphs: [
          'A boundary does more than mark where a ball goes out. In a photograph, it gives the frame a rhythm. In our authored “The outside lane” scene, the touchline gives the overlapping run a clear reference. One player moves inside and another continues beyond.',
          'Open that scene after looking at the street-court image. The real place and the fictional replay are different things, but both ask you to notice how space shapes the way a movement looks. A narrow lane can become the most interesting part of the picture.',
        ],
      },
      {
        title: 'There is room for another perspective.',
        paragraphs: [
          'You do not need to agree on the best player, the best formation or the best team to have a good conversation about a move. “Watch this run” is a more generous starting point than “Here is the only right answer.” It gives another person something specific to look at.',
          'That is the idea behind the replay room. Keep a view, write a short observation and share the perspective rather than a verdict. Someone else may notice the defender you overlooked, or choose an angle that makes your original question more interesting.',
        ],
      },
      {
        title: 'Take the long way home.',
        paragraphs: [
          'Football can be the match itself and the things around it: the light across an empty stand, the sound from a nearby court, the route people take when a game is over. Those details deserve space alongside the highlights.',
          'Our journal pairs those textures with small ways of looking at the game. Read a story, open a sequence, then go back to the story. The point is to leave with something you want to notice next time.',
        ],
      },
    ],
  },
  {
    slug: 'the-first-seconds-of-something',
    category: 'Tactics',
    title: 'The first seconds of something.',
    shortTitle: 'Turn. Look. Go.',
    intro:
      'Possession changes. So does the picture. Follow the first movements of a transition, one frame at a time.',
    image: 'training',
    alt: 'Football players in a practice session on a grass pitch',
    caption: 'A new phase starts before the whole picture has settled.',
    issue: '04',
    momentId: 'turn-and-go',
    pullquote: 'A transition is a good place to slow the game down.',
    sections: [
      {
        title: 'Begin at the beginning.',
        paragraphs: [
          'A replay often starts where the excitement becomes obvious. Try starting a little earlier. In our “Turn. And go.” sequence, use the restart control and pause before the first forward action. Look at the positions as a still image before you follow them as a move.',
          'This sequence is authored to make that comparison easy. Its eight seconds are a complete illustration, not a reconstruction of a real fixture. The useful thing is being able to go back to the same starting state and ask a different question each time.',
        ],
      },
      {
        title: 'Separate the jobs.',
        paragraphs: [
          'Watch one replay for the player carrying the ball. Watch a second for the teammates ahead. On the third, look at the closest defenders. That small change in attention can make a short sequence feel less like one event and more like several movements happening together.',
          'Use half speed if the change of direction is difficult to follow. The transport evaluates absolute time, so seeking to a saved timestamp gives the same authored frame. A slower replay is a different way to inspect the scene, not a different version of the movement.',
        ],
      },
      {
        title: 'Find the frame that explains it.',
        paragraphs: [
          'Scrub backwards from the final ball action. Stop at the earliest frame where the route starts to make sense to you. Put that view next to the opening position in your mind. What changed: the player’s position, the angle of the pass, or the space between two opponents?',
          'There is no score for getting the answer right here. The playbook offers three checkpoints to start a conversation, and the replay room lets you choose your own. Try top-down for the shape and touchline for the depth of the move.',
        ],
      },
      {
        title: 'Leave yourself a useful note.',
        paragraphs: [
          'A good observation can be a sentence or a question. “Watch the runner before the forward pass” is something you can revisit. “Could the wide player have stayed outside longer?” leaves the thought open. Neither needs to become a grand theory of the match.',
          'Save the exact view and return later with a clean pitch. If you still see the same idea without the run trails, keep it. If you see something different, edit the note. The collection is meant to change as your attention does.',
        ],
      },
    ],
  },
];

export const readingMinutes = (story: Story) =>
  Math.max(
    1,
    Math.ceil(
      story.sections
        .flatMap((s) => s.paragraphs)
        .join(' ')
        .split(/\s+/).length / 180,
    ),
  );

export type Guide = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  momentId: string;
  image: string;
  alt: string;
  playerId: string;
  chapters: { title: string; timeMs: number; body: string; watch: string }[];
};
export const guides: Guide[] = [
  {
    slug: 'find-the-pocket',
    title: 'Find the pocket.',
    kicker: '01 / READING SPACE',
    description: 'Follow the player who turns a small gap into the beginning of a move.',
    momentId: 'between-the-lines',
    image: 'ball-detail',
    alt: 'A close view of a football and boots on the pitch',
    playerId: 'h10',
    chapters: [
      {
        title: 'Read the shape',
        timeMs: 0,
        body: 'Begin with the full picture. Find Moreau, number 10, and the space between the lines in this authored sequence. Notice the position of the forward before the ball moves.',
        watch: 'Look at the nearest opponent, then at the teammate beyond him.',
      },
      {
        title: 'Find the pocket',
        timeMs: 3600,
        body: 'The highlighted player has changed his position. Compare where he is now with where he started. The run trails keep the earlier path visible while you study the current frame.',
        watch: 'Follow number 10 before following the ball.',
      },
      {
        title: 'Follow the release',
        timeMs: 7400,
        body: 'The move now points beyond the defensive line. Follow the connection between the pass and the forward run. Open the replay room to scrub between these checkpoints and make your own observation.',
        watch: 'Switch to touchline to compare the depth of the run.',
      },
    ],
  },
  {
    slug: 'change-the-point',
    title: 'Change the point.',
    kicker: '02 / USING THE WIDTH',
    description: 'Look across the pitch. The most interesting space may be on the other side.',
    momentId: 'the-far-side',
    image: 'field-aerial',
    alt: 'The full width of a football field seen from above',
    playerId: 'h7',
    chapters: [
      {
        title: 'See both sides',
        timeMs: 0,
        body: 'Start above the pitch and find the wide players. This frame is a reference point for comparing the near side with the far side, not a tactical rating or a live match measurement.',
        watch: 'Find the receiver before watching the passing sequence.',
      },
      {
        title: 'Watch the preparation',
        timeMs: 4400,
        body: 'The short combination draws your eye to one area. Keep the opposite side in view and compare the receiving player’s position with the path of the ball.',
        watch: 'Ask what is happening away from the nearest group.',
      },
      {
        title: 'Open the frame',
        timeMs: 9000,
        body: 'The diagonal has changed the picture. Use the replay room to compare the view before the switch with the arrival, keeping the camera at the same angle for both.',
        watch: 'Save the frame that best explains the change in space.',
      },
    ],
  },
  {
    slug: 'see-the-transition',
    title: 'See the transition.',
    kicker: '03 / CHANGING THE PHASE',
    description: 'Slow down the opening seconds of a move that seems to happen all at once.',
    momentId: 'turn-and-go',
    image: 'training',
    alt: 'Players taking part in football training',
    playerId: 'h9',
    chapters: [
      {
        title: 'Keep the opening frame',
        timeMs: 0,
        body: 'Look at the first arrangement of players. Choose one runner to follow and use the opening position as your reference throughout the sequence.',
        watch: 'Find the players ahead of the ball before the first forward action.',
      },
      {
        title: 'Separate the movements',
        timeMs: 3200,
        body: 'Compare the highlighted runner with the ball carrier. Their movements do different things in the illustration. Keep the trails visible for this comparison.',
        watch: 'Look at the direction of a run as well as its destination.',
      },
      {
        title: 'Put it together',
        timeMs: 6400,
        body: 'The move is close to its final action. Open the full scene, choose half speed and return to the earliest frame that explains the idea to you.',
        watch: 'Write a question in your saved observation, then revisit it later.',
      },
    ],
  },
];

export function guideView(guide: Guide, chapter = 1): ViewState {
  return {
    ...defaultView,
    momentId: guide.momentId,
    timeMs: guide.chapters[chapter]!.timeMs,
    camera: 'tactical',
    playerId: guide.playerId,
    layers: { passing: true, trails: true, zones: true },
  };
}

export const faqs = [
  {
    question: 'What is Rafarena?',
    answer:
      'An independent football experience: a journal of perspectives, a visual playbook and an interactive replay room. Read a story, follow an idea, then step inside a sequence to see it from another angle.',
  },
  {
    question: 'Are these real matches?',
    answer:
      'The replay room uses fictional teams, players and authored movements. It is a space to explore ideas, not a live feed, a tracking service or a prediction model. The editorial photographs are real images credited to their photographers.',
  },
  {
    question: 'Can I keep a perspective?',
    answer:
      'Yes. The replay room saves the exact moment, camera, selected player and layers, together with your title and observation. Saved views belong to the current browser. Share a perspective link to keep its viewing state outside this device.',
  },
  {
    question: 'What if 3D is unavailable?',
    answer:
      'A complete 2D tactical view is ready when your browser does not support the 3D renderer. You can still replay, select players, save views, share a perspective and download a pitch image.',
  },
];
