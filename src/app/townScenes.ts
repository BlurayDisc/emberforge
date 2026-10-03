import type { SlidingView } from '../render/slidingView';
import { isInCastle, onCastleVisitChange } from '../ui/castleVisit';

// The run player asks for "the town" when no fight is on screen. The player may be in the castle then, so this picks the scene.
export function combineTownAndCastle(townView: SlidingView, castleView: SlidingView): SlidingView {
  let isTownSceneWanted = false;
  const showTheRightScene = (): void => {
    const isInside = isInCastle();
    // The town goes first: hiding it puts the camera back at 0, and the castle then sets its own camera.
    townView.setVisible(isTownSceneWanted && !isInside);
    castleView.setVisible(isTownSceneWanted && isInside);
  };
  onCastleVisitChange(showTheRightScene);
  return {
    setVisible: (isVisible) => {
      isTownSceneWanted = isVisible;
      showTheRightScene();
    },
    goToScreen: townView.goToScreen,
    currentScreen: townView.currentScreen,
    onScroll: townView.onScroll,
  };
}
