import type { SceneToggle, SlidingView } from '../render/slidingView';
import { isInCastle, onCastleVisitChange } from '../ui/castleVisit';

// The run player asks for "the town" when no fight is on screen. The player may be in the castle then, so this picks the scene.
export function combineTownAndCastle(townView: SceneToggle, castleView: SlidingView): SceneToggle {
  let isTownSceneWanted = false;
  const showTheRightScene = (): void => {
    const isInside = isInCastle();
    // The town goes first: hiding it lets the castle set its own camera and layout.
    townView.setVisible(isTownSceneWanted && !isInside);
    castleView.setVisible(isTownSceneWanted && isInside);
  };
  onCastleVisitChange(showTheRightScene);
  return {
    setVisible: (isVisible) => {
      isTownSceneWanted = isVisible;
      showTheRightScene();
    },
  };
}
