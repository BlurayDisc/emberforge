import { MAXIMUM_PARTY_SIZE } from '../../content/balance/economy';

export function canJoinParty(partyHeroIds: readonly string[]): boolean {
  return partyHeroIds.length < MAXIMUM_PARTY_SIZE;
}

export function togglePartyMembership(partyHeroIds: readonly string[], heroId: string): string[] {
  if (partyHeroIds.includes(heroId)) return partyHeroIds.filter((memberId) => memberId !== heroId);
  if (!canJoinParty(partyHeroIds)) return [...partyHeroIds];
  return [...partyHeroIds, heroId];
}
