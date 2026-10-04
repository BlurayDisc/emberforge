import { runBossFightScenario } from './scenarios/bossFightScenario';
import { runEconomyScenario } from './scenarios/economyScenario';
import { runExperienceScenario } from './scenarios/experienceScenario';
import { runMobKillTimeScenario } from './scenarios/mobKillTimeScenario';
import { runResourceUseScenario } from './scenarios/resourceUseScenario';

// Edit the files in tools/balance-sim/presets to change a scenario. Run one by name, or all with no name.
const SCENARIOS: Record<string, () => void> = {
  economy: runEconomyScenario,
  experience: runExperienceScenario,
  'mob-kill-time': runMobKillTimeScenario,
  'boss-fight': runBossFightScenario,
  'resource-use': runResourceUseScenario,
};

const requestedNames = process.argv.slice(2);
const names = requestedNames.length === 0 ? Object.keys(SCENARIOS) : requestedNames;
for (const name of names) {
  const scenario = SCENARIOS[name];
  if (!scenario) throw new Error(`Unknown scenario '${name}'. Use one of: ${Object.keys(SCENARIOS).join(', ')}`);
  scenario();
}
