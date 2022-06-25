#!/bin/bash

GIT_LOG="git log --oneline --decorate --graph"

git fetch # refresh local tags

LAST_TAG_LINE_FROM_LOG=$($GIT_LOG | head -n 100 | grep -nE 'tag' | head -n1 |
  awk '{ print $1 }' | sed -E 's/\:.+$//')

$GIT_LOG | head -n "$(($LAST_TAG_LINE_FROM_LOG - 1))"
