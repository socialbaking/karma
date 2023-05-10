import gitCommitInfo from "git-commit-info";

export const info = gitCommitInfo();
export const date = new Date(info.date)

export const msSinceCommit = Date.now() - date.getTime();
export const secondsBetweenCommitAndBuildValue = msSinceCommit / 1000;
export const minutesBetweenCommitAndBuildValue = secondsBetweenCommitAndBuildValue / 60;
export const secondsBetweenCommitAndBuild = toNumberRoundedString(secondsBetweenCommitAndBuildValue);
export const minutesBetweenCommitAndBuild = toNumberRoundedString(minutesBetweenCommitAndBuildValue);

export const minutesFloored = Math.floor(minutesBetweenCommitAndBuildValue)
export const secondsWithoutMinutes = Math.floor(secondsBetweenCommitAndBuildValue - (minutesFloored * 60));
export const secondsTime = secondsWithoutMinutes > 1 ? ` and ${secondsWithoutMinutes} seconds` : "";
export const timeBetweenCommitAndBuild = `${minutesFloored} minutes${secondsTime}`

function toNumberRoundedString(value) {
    return Math.round(value * 100) / 100
}