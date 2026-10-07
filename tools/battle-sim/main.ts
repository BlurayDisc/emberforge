import '../../src/ui/styles/theme.css';
import '../../src/ui/styles/components.css';
import '../../src/ui/styles/stage.css';
import { configureAudio } from '../../src/audio';
import { presentBattleEvent } from '../../src/app/battleEventPresenter';
import { logEntriesForEvent } from '../../src/app/battleLogEntries';
import { loadAudioPreferences } from '../../src/game';
import type { BattleUnit } from '../../src/model/battle';
import type { RealtimeBattleReport } from '../../src/model/realtimeBattle';
import { createBattleView } from '../../src/render/battleView';
import { createPixelStage } from '../../src/render/pixelStage';
import { element } from '../../src/ui/dom';
import { initializeLanguage, setLanguage } from '../../src/ui/i18n';
import { listOf, unitDisplayName } from '../../src/ui/displayNames';
import { buildUnits, runManyBattles, simulate } from './battleSetup';
import { say } from './battleSimTexts';
import { button, renderSetupForm, setupOf, type FormState } from './controlsPanel';
import { applyQueryToForm } from './pageQuery';
import { appendLogEntries, renderLivePanel, renderSummary, type LivePanel } from './simPanels';
import { describeUnitStats } from './unitStatsText';

const MONTE_CARLO_BATTLES = 20;
const JUMP_STEP_SECONDS = 1 / 30;
const MAXIMUM_FRAME_SECONDS = 0.1;
const SPEEDS = [1, 2, 4] as const;
const BACKDROP_ID = 'goblin-camp';
const byId = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

initializeLanguage();
configureAudio(loadAudioPreferences());

const form: FormState = { heroClass: 'warrior', heroLevel: 3, gearState: 'common', hasSecondHero: false, secondClass: 'priest', secondLevel: 3, creepId: 'cave-rat', creepLevel: 3, creepLevelIsCustom: false, creepCount: 1, seed: 1 };
const query = applyQueryToForm(form, new URLSearchParams(window.location.search));

const stage = createPixelStage(byId('stage-host'));
const view = createBattleView(stage);
view.setBackdrop(BACKDROP_ID);
view.setVisible(true);

interface RunningBattle {
  report: RealtimeBattleReport;
  units: BattleUnit[];
  unitsById: Map<string, BattleUnit>;
  nextEventIndex: number;
  battleSeconds: number;
  hasFinished: boolean;
  live: LivePanel;
  logState: { unitsById: Map<string, BattleUnit>; lastLoggedTimeMarker: number };
}

let battle: RunningBattle | null = null;
let isPaused = false;
let speed = 1;

function renderStatsPanels(): void {
  const { heroUnits, creepUnits } = buildUnits(setupOf(form));
  const rows = (unit: BattleUnit): HTMLElement => element('div', 'sim-stat-block', element('div', 'sim-stat-title', `${unitDisplayName(unit)} L${unit.level}`), ...describeUnitStats(unit).map(([name, value]) => element('div', 'sim-stat', element('span', 'sim-stat-name', name), element('span', 'sim-stat-value', value))));
  byId('sim-hero-stats').replaceChildren(element('h3', 'sim-heading', say('heroStats')), ...heroUnits.map(rows));
  byId('sim-creep-stats').replaceChildren(element('h3', 'sim-heading', say('creepStats')), rows(creepUnits[0] as BattleUnit));
}

function renderRunControls(): void {
  const speedButtons = SPEEDS.map((value) => button(`sim-speed-${value}`, `${value}x`, () => setSpeed(value)));
  const seedInput = element('input', 'sim-input');
  seedInput.id = 'sim-seed';
  seedInput.type = 'number';
  seedInput.value = String(form.seed);
  seedInput.addEventListener('change', () => {
    form.seed = Math.round(Number(seedInput.value));
  });
  const randomSeedButton = button('sim-random-seed', say('randomSeed'), () => {
    form.seed = Math.floor(Math.random() * 1_000_000);
    seedInput.value = String(form.seed);
  });
  byId('sim-run-controls').replaceChildren(
    element('label', 'sim-field', element('span', 'sim-label', say('seed')), seedInput),
    element('div', 'sim-row', randomSeedButton, button('sim-start', say(battle ? 'restart' : 'start'), startBattle), button('sim-pause', say(isPaused ? 'resume' : 'pause'), togglePause)),
    element('div', 'sim-row', element('span', 'sim-label', say('speed')), ...speedButtons),
    element('div', 'sim-row', button('sim-monte-carlo', say('monteCarlo'), runMonteCarlo), button('sim-lang-en', 'EN', () => switchLanguage('en')), button('sim-lang-zh', '中文', () => switchLanguage('zh'))),
  );
  speedButtons.forEach((speedButton, index) => speedButton.classList.toggle('selected', SPEEDS[index] === speed));
}

function renderAllText(): void {
  document.title = say('title');
  byId('sim-title').textContent = say('title');
  byId('sim-live-title').textContent = say('live');
  byId('sim-log-title').textContent = say('log');
  byId('sim-summary-title').textContent = say('summary');
  renderSetupForm(byId('sim-setup'), form, onFormChange);
  renderRunControls();
  renderStatsPanels();
  if (!battle) byId('sim-summary').textContent = say('waiting');
}

function onFormChange(): void {
  renderStatsPanels();
}

function switchLanguage(language: 'en' | 'zh'): void {
  setLanguage(language);
  renderAllText();
}

function setSpeed(newSpeed: number): void {
  speed = newSpeed;
  view.setTimeScale(isPaused ? 0 : speed);
  renderRunControls();
}

function togglePause(): void {
  isPaused = !isPaused;
  view.setTimeScale(isPaused ? 0 : speed);
  renderRunControls();
}

function startBattle(): void {
  const setup = setupOf(form);
  const { heroUnits, creepUnits } = buildUnits(setup);
  const units = [...heroUnits, ...creepUnits];
  const report = simulate(heroUnits, creepUnits, setup.seed);
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  view.showUnits(units);
  view.setRealtimeBattle(report);
  view.setTimeScale(isPaused ? 0 : speed);
  const live = renderLivePanel(byId('sim-live'), units);
  byId('sim-log').replaceChildren();
  byId('sim-summary').replaceChildren();
  battle = { report, units, unitsById, nextEventIndex: 0, battleSeconds: 0, hasFinished: false, live, logState: { unitsById, lastLoggedTimeMarker: -1 } };
  appendLogEntries(byId('sim-log'), [{ kind: 'fight', monsters: listOf(creepUnits.map((unit) => unitDisplayName(unit))) }]);
  renderRunControls();
}

// Moves the battle time forward and shows every event up to it. The stage draws the units at the same battle time.
function advanceBattle(deltaSeconds: number): void {
  if (!battle) return;
  const running = battle;
  running.battleSeconds = Math.min(running.battleSeconds + deltaSeconds, running.report.durationSeconds + 2);
  for (let event = running.report.events[running.nextEventIndex]; event && event.timeSeconds <= running.battleSeconds; event = running.report.events[running.nextEventIndex]) {
    presentBattleEvent(view, event, running.report.events, running.nextEventIndex, running.unitsById);
    running.live.setHealth(event.targetId, event.targetHpAfter);
    appendLogEntries(byId('sim-log'), logEntriesForEvent(event, running.logState));
    running.nextEventIndex += 1;
  }
  view.setBattleTime(running.battleSeconds);
  byId('sim-clock').textContent = `${Math.min(running.battleSeconds, running.report.durationSeconds).toFixed(1)} / ${running.report.durationSeconds.toFixed(1)} ${say('seconds')}`;
  if (!running.hasFinished && running.battleSeconds >= running.report.durationSeconds) {
    running.hasFinished = true;
    appendLogEntries(byId('sim-log'), [{ kind: 'result', won: running.report.winner === 'party' }]);
    renderSummary(byId('sim-summary'), running.report, running.units, running.report.events);
  }
}

// Starts the battle again and runs it to this battle time at once, then pauses. The screenshot tool uses it to catch an exact moment.
function jumpTo(battleSeconds: number): number {
  startBattle();
  isPaused = true;
  view.setTimeScale(0);
  for (let elapsed = 0; elapsed < battleSeconds; elapsed += JUMP_STEP_SECONDS) {
    const step = Math.min(JUMP_STEP_SECONDS, battleSeconds - elapsed);
    advanceBattle(step);
    view.advanceTime(step);
  }
  renderRunControls();
  return battleSeconds;
}

async function runMonteCarlo(): Promise<void> {
  const resultLine = byId('sim-monte-result');
  resultLine.textContent = '...';
  const result = await runManyBattles(setupOf(form), MONTE_CARLO_BATTLES);
  resultLine.textContent = say('monteCarloResult', { battles: result.battles, winRate: Math.round(result.winRatePercent), seconds: result.averageSeconds.toFixed(1), hpLost: Math.round(result.averageHeroHpLostPercent) });
}

let previousFrameSeconds: number | null = null;
stage.onFrame((elapsedSeconds) => {
  const frameSeconds = previousFrameSeconds === null ? 0 : Math.min(MAXIMUM_FRAME_SECONDS, elapsedSeconds - previousFrameSeconds);
  previousFrameSeconds = elapsedSeconds;
  if (!isPaused) advanceBattle(frameSeconds * speed);
});

Object.assign(window, { battleSim: { start: startBattle, jumpTo, togglePause, setSpeed, runMonteCarlo } });
renderAllText();
if (query.speed !== null) setSpeed(query.speed);
if (query.startAtSeconds !== null) jumpTo(query.startAtSeconds);
else if (query.autostart) startBattle();
