
import { MatchEvent, Team, Player, MatchStats } from '../types';

type MatchFlow = 'CAGEY' | 'BALANCED' | 'HIGH_TEMPO' | 'THRILLER' | 'ONE_SIDED' | 'DRAMATIC';

type CommentaryPool = {
  [key: string]: string[];
};

const FLOW_ADJECTIVES: Record<MatchFlow, string[]> = {
  CAGEY: ["In a tight tactical stalemate", "With space at a premium", "In this defensive chess match"],
  BALANCED: ["In a finely balanced contest", "With both teams finding their rhythm", "As the tactical battle unfolds"],
  HIGH_TEMPO: ["In this breathless end-to-end trial", "With the speed of play intensifying", "Amidst this high-octane showcase"],
  THRILLER: ["In this absolute classic", "With both sides committed to attack", "In a match that's had everything"],
  ONE_SIDED: ["In this complete mismatch", "As the dominance becomes overwhelming", "Continuing the masterclass"],
  DRAMATIC: ["IN STUNNING CIRCUMSTANCES", "WITH TENSIONS AT BREAKING POINT", "IN A MOMENT OF PURE THEATRE"]
};

const TEMPLATES: CommentaryPool = {
  // EXAGGERATED 3-LINE GOAL NARRATIVES
  GOAL_HEADER: [
    "{adj}.\n{player} rises like a salmon in a mountain stream, towering over the mere mortals in defense!\nHe powers a thunderous header into the top corner that nearly rips the netting! ABSOLUTELY MAGNIFICENT!",
    "{adj}.\nA cross of pure velvet finds {player} who leaps with the grace of a gazelle.\nHe nods it downward with pinpoint accuracy, leaving the keeper clutching at thin air! AN AERIAL MASTERCLASS!",
    "{adj}.\nAERIAL DOMINANCE! {player} out-muscles his marker and meets the ball with a forehead of iron!\nIt rockets into the roof of the net! The stadium is in raptures!"
  ],
  GOAL_LONG_RANGE: [
    "{adj}.\nOH MAMA MIA! {player} catches everyone cold from 35 yards out with a strike of pure volcanic power!\nIt's a guided missile that defies the laws of physics and screams into the side-netting! HE'S PRODUCED A MIRACLE!",
    "{adj}.\nTAKE A BOW, SON! {player} lets fly from distance and the ball behaves like a tracer bullet!\nThe keeper is a mere spectator as this screamer nestles in the corner! A GOAL FOR THE AGES!",
    "{adj}.\nHE'S HIT THAT FROM ANOTHER POSTCODE! {player} unleashes a thunderbolt with the venom of a cobra!\nSENSATIONAL! It's a goal that will be talked about for decades!"
  ],
  GOAL_SOLO: [
    "{adj}.\nMAGIC! {player} embarks on a mazy, slaloming run, leaving defenders lying in his wake like discarded furniture!\nHe executes a dazzling roulette, skips past the last man, and slots it home with ice-cold composure! GENIUS AT WORK!",
    "{adj}.\nTHE ELASTICO! {player} dazzles the fullback with footwork from another planet before cutting inside!\nHe dances through the heart of the defense and curls a beauty into the far corner! UNSTOPPABLE INDIVIDUAL BRILLIANCE!",
    "{adj}.\n{player} is playing a different game! He beats one, beats two, nutmegs the third and fires home!\nIt's a one-man demolition job! HE IS THE MASTER OF THE PITCH!"
  ],
  GOAL_SET_PIECE: [
    "{adj}.\nCURLED WITH THE PRECISION OF A SURGEON! {player} lofts a free-kick over the wall with incredible dip!\nIt kisses the post and goes in! A moment of technical perfection from the dead-ball specialist!",
    "{adj}.\nCORNER CHAOS! The delivery is whipped in with wicked intent and {player} reacts first in the scramble!\nHe pokes it home amidst a forest of legs! {team} HAVE BROKEN THE DEADLOCK!",
    "{adj}.\nDIRECT AND DEADLY! {player} hammers the free-kick with the force of a wrecking ball!\nIt flies through the wall and nearly breaks the keeper's hand on its way in! BRUTAL POWER!"
  ],
  GOAL_TAPPED: [
    "{adj}.\nPOACHER'S PERFECTION! {player} shows the instincts of a shark, sniffing out the rebound before anyone else!\nHe taps it in from six inches! He's always in the right place at the right time!",
    "{adj}.\nA TEAM GOAL OF PURE BEAUTY! One-touch passing carves them open and {player} is there to finish the job!\nSimple. Elegant. Clinical. {team} are playing like gods today!",
    "{adj}.\n{player} waits at the back post and side-foots it into an empty net after a selfless setup!\nThat is the definition of unselfish play! A goal of collective harmony!"
  ],

  // SKILLS & DRIBBLES
  SKILL_STEP_OVER: [
    "{player} bamboozles the marker with a flurry of step-overs before accelerating away with lightning pace!",
    "The step-over king! {player} shimmies left, goes right, and leaves the defender in a heap of confusion!",
    "Light on his feet! {player} uses a quick double step-over to find half a yard of space and drive forward."
  ],
  SKILL_ROULETTE: [
    "MAMA MIA! {player} spins like a top with a perfect Zidane roulette, leaving his marker standing still!",
    "{player} pirouettes through the challenge! A moment of pure balletic beauty that opens up the pitch.",
    "The 360 spin from {player}! He's escaped his marker in style, showing technique that belongs in a museum!"
  ],
  SKILL_NUTMEG: [
    "OH HE'S LEFT HIM FOR DEAD! {player} pops it through the defender's legs! The ultimate humiliation on the trial pitch!",
    "Through the gates! {player} nutmegs his marker and keeps his stride! Cheeky and effective from the attacker!",
    "A bit of 'olè' from {player} as he threads it between the opponent's ankles! The crowd (if there were any) would be on their feet!"
  ],

  // MISSED CHANCES
  MISS_WOODWORK: [
    "THE METALLIC RING OF DESPAIR! {player} strikes it beautifully but the crossbar is still shaking from the impact!",
    "UNBELIEVABLE! {player} beats the keeper but the post stands firm! Inches from glory in this tight match!",
    "How has that stayed out?! It hits the inside of the upright and rolls across the face of the goal! TOTAL AGONY!"
  ],
  MISS_SKYED: [
    "NASA, WE HAVE A PROBLEM! {player} gets under it and sends the ball into the stratosphere!",
    "He's hit that into Row Z! {player} fails to keep his head down and the chance is gone in a flash of poor technique.",
    "A shocking miss! {player} tries for pure power but sends it orbiting the stadium instead of nestling it in the corner."
  ],
  MISS_NARROW: [
    "SO CLOSE! {player} whistles one past the post! You could see the keeper was worried about that one.",
    "Just wide! {player} finds a pocket of space and drags his shot across the goal. Half the stadium thought that was in!",
    "A coat of paint away! {player} curls it toward the far corner but it just refuses to tuck in."
  ],
  SHOT_BLOCKED: [
    "BLOCKED! {player} pulls the trigger but a defender throws himself into the line of fire! Brave defending!",
    "{player} lets fly, but it strikes a wall of bodies! The defense is holding firm under pressure.",
    "No way through! {player} finds a gap but it's closed instantly by a sliding block! Tactical awareness at its best."
  ],

  // DEFENSE
  TACKLE_SLIDING: [
    "A SUICIDE SLIDE! {player} risks everything with a last-man tackle and wins the ball cleanly! HEROIC DEFENDING!",
    "THE CRUNCH! {player} goes in hard and fair with a perfectly timed sliding challenge! The crowd roars!",
    "Surgical precision! {player} glides across the turf and hooks the ball away from the attacker's toes!"
  ],
  TACKLE_STANDING: [
    "WHAT A CHALLENGE! {player} dispossesses the striker just as he was about to pull the trigger! CLUTCH TIMING!",
    "Strength and poise! {player} stands his ground and simply picks the attacker's pocket. Expertly done.",
    "Defensive brilliance! {player} reads the shoulder drop and steps in with a perfectly timed intervention to halt the break."
  ],
  INTERCEPTION_CLEARED: [
    "DANGER AVERTED! {player} reads the cross and thumps a clearance into the stands! Safety first.",
    "{player} is in the right place! He intercepts the through-ball and hacks it clear before the strikers can react.",
    "No-nonsense defending! {player} snuffs out the danger and clears his lines with authority."
  ],
  INTERCEPTION_READ: [
    "READ LIKE A BOOK! {player} steps out from the back to intercept a lazy pass! He's started a counter!",
    "{player} anticipates the move perfectly! He intercepts the square ball and sets his team on the front foot.",
    "Vision from the back! {player} cuts out the passing lane and regains possession with ease."
  ],

  // GOALKEEPING
  SAVE_CRUCIAL: [
    "WORLD-CLASS REFLEXES! {player} defies logic with a point-blank save! He's a brick wall today!",
    "HOW DID HE SAVE THAT?! {player} tips a goalbound screamer over the bar at full stretch! INCREDIBLE AGILITY!",
    "THE GREAT WALL OF {team}! {player} blocks the effort with his fingertips! SENSATIONAL GOALKEEPING!"
  ],
  SAVE_FEET: [
    "SAVED BY THE BOOT! {player} spreads himself like a hockey keeper and denies the striker with a trailing leg!",
    "Hockey-style save! {player} uses his feet to keep the low drive out! Incredible instincts!",
    "Reaction save! {player} gets a firm foot to the ball to deflect it wide of the post! Narrow escape!"
  ],

  // CHANCE CREATION
  CHANCE_CREATED: [
    "{player} carves them open! A ball of pure vision that sets the attacker free.",
    "Vision of a hawk! {player} threads the eye of a needle to create a massive opening for his teammate.",
    "Tactical masterclass! {player} spots the run early and delivers a pass that takes three defenders out of the game."
  ],

  // SET PIECES
  FREE_KICK_DANGER: [
    "{player} steps up to the dead ball. Tensions are high as he prepares to strike.",
    "Free kick in a dangerous area! {player} is eyeing up the top corner with predatory intent.",
    "The wall is set, but {player} looks confident. This is his territory."
  ],
  CORNER_IN: [
    "The corner is whipped in by {player}! A forest of bodies rises to meet it.",
    "{player} delivers a pacy ball into the danger zone! Chaos in the six-yard box.",
    "A flat, dangerous corner from {player}! Defenders are scrambling to clear their lines."
  ],

  // CARDS
  YELLOW_CARD: [
    "The referee has seen enough! {player} enters the book for a cynical trip.",
    "YELLOW CARD! {player} is cautioned after that reckless lunge. He needs to be careful now.",
    "A booking for {player}! He stopped the counter-attack but at the cost of a yellow."
  ],
  RED_CARD: [
    "REEEEEED CARD! {player} is sent for an early shower! A moment of madness that costs his team dearly!",
    "SHOCKING SCENES! {player} sees red for a dangerous challenge! {team} are down to ten men!",
    "OFF! {player} is dismissed! The referee didn't hesitate for a second. A huge blow for {team}!"
  ],

  // ERROR
  ERROR: [
    "A TOTAL ECLIPSE OF THE BRAIN! {player} gifts the ball away in the danger zone!",
    "DISASTER! {player} miscontrols and looks on in horror as the opposition pounces!",
    "A nightmare moment for {player}. A heavy touch results in an immediate turnover and a counter-attack."
  ],
  SUMMARY_HT: ["The whistle blows for half-time. The score stands at {score}. Tactical adjustments imminent in the dressing rooms."],
  SUMMARY_FT: ["Full-time! A breathtaking trial match concludes. The final verdict: {score}. The scouts have much to discuss."]
};

class CommentaryEngine {
  private usedTemplates: Set<string> = new Set();

  private getMatchFlow(stats: MatchStats, score: [number, number], minute: number): MatchFlow {
    const scoreDiff = Math.abs(score[0] - score[1]);
    if (minute > 80 && scoreDiff <= 1) return 'DRAMATIC';
    if (scoreDiff >= 4) return 'ONE_SIDED';
    if (score[0] + score[1] >= 6) return 'THRILLER';
    if (stats.totalShots[0] + stats.totalShots[1] > minute * 0.45) return 'HIGH_TEMPO';
    if (minute > 35 && score[0] + score[1] === 0) return 'CAGEY';
    return 'BALANCED';
  }

  private getRandomAdj(flow: MatchFlow): string {
    const options = FLOW_ADJECTIVES[flow];
    return options[Math.floor(Math.random() * options.length)];
  }

  private getTemplate(poolKey: string): string {
    const variations = TEMPLATES[poolKey] || TEMPLATES['GOAL_TAPPED'];
    const available = variations.filter(v => !this.usedTemplates.has(v));
    const source = available.length > 0 ? available : variations;
    const selected = source[Math.floor(Math.random() * source.length)];
    this.usedTemplates.add(selected);
    return selected;
  }

  public generateGoalCommentary(
    player: Player, 
    team: Team, 
    minute: number, 
    score: [number, number],
    stats: MatchStats,
    type: 'HEADER' | 'LONG_RANGE' | 'SOLO' | 'SET_PIECE' | 'TAPPED',
    assistBy?: string
  ): string {
    const flow = this.getMatchFlow(stats, score, minute);
    const adj = this.getRandomAdj(flow);
    const poolKey = `GOAL_${type}`;

    let text = this.getTemplate(poolKey)
      .replace(/{adj}/g, adj)
      .replace(/{player}/g, player.name)
      .replace(/{team}/g, team.name);

    if (assistBy) {
      const assistPhrases = [
        ` Setup provided by the vision of ${assistBy}.`,
        ` ${assistBy} gets the assist for a truly telepathic pass.`,
        ` That ball from ${assistBy} was absolutely sublime.`
      ];
      text += "\n" + assistPhrases[Math.floor(Math.random() * assistPhrases.length)];
    }

    return text;
  }

  public generateSkillCommentary(player: Player): string {
    const skillKeys = ['SKILL_STEP_OVER', 'SKILL_ROULETTE', 'SKILL_NUTMEG'];
    const key = skillKeys[Math.floor(Math.random() * skillKeys.length)];
    return this.getTemplate(key).replace(/{player}/g, player.name);
  }

  public generateMiscCommentary(type: string, player: Player): string {
    const keyMap: any = { 
        WOODWORK: 'MISS_WOODWORK', 
        SKYED: 'MISS_SKYED', 
        NARROW: 'MISS_NARROW', 
        BLOCKED: 'SHOT_BLOCKED',
        TACKLE_SLIDING: 'TACKLE_SLIDING',
        TACKLE_STANDING: 'TACKLE_STANDING',
        INTERCEPTION_CLEARED: 'INTERCEPTION_CLEARED',
        INTERCEPTION_READ: 'INTERCEPTION_READ',
        CHANCE: 'CHANCE_CREATED',
        FREE_KICK: 'FREE_KICK_DANGER',
        CORNER: 'CORNER_IN',
        YELLOW_CARD: 'YELLOW_CARD',
        RED_CARD: 'RED_CARD'
    };
    const key = keyMap[type] || 'CHANCE_CREATED';
    return this.getTemplate(key).replace(/{player}/g, player.name);
  }

  public generateSaveCommentary(player: Player, type: 'CRUCIAL' | 'FEET' = 'CRUCIAL'): string {
    const key = type === 'FEET' ? 'SAVE_FEET' : 'SAVE_CRUCIAL';
    return this.getTemplate(key).replace(/{player}/g, player.name);
  }

  public generateErrorCommentary(player: Player): string {
    return this.getTemplate("ERROR").replace(/{player}/g, player.name);
  }

  public getSummary(type: 'HT' | 'FT', score: [number, number]): string {
    return this.getTemplate(`SUMMARY_${type}`).replace(/{score}/g, `${score[0]}-${score[1]}`);
  }

  public reset(): void { this.usedTemplates.clear(); }
}

export const commentaryEngine = new CommentaryEngine();
