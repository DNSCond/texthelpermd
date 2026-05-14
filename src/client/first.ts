// first
export const { currentUserIsCurrentlyBanned, isApprovedUser, isLoggedIn }: {
  currentUserIsCurrentlyBanned: boolean,
  isApprovedUser: boolean,
  isLoggedIn: boolean
} = await fetch('/api/currentUser').then(resp => {
  if (!resp.ok) throw resp;
  return resp.json();
});
