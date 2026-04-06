---
name: Feature request
about: New feature or enhancement
title: ''
labels: ''
assignees: ''

---

**AS A** *role or user type*
**I WANT** *the feature or functionality desired*
**SO THAT** *desired outcome or goal*

### Acceptance Criteria
## SQL criterias
- [ ] SQL calls out created chats between specified time. Including the time marked on the datetime field (1st of Januarty includes data starting from 1st).
- [ ] Counted chats need to have an ENDED status.
- [ ] Only unique chats are counted.
- [ ] All CSA chats are counted as CSA chats, everything else (pending, failed, system etc where no CSA is present) would be listed as a Bürokratt chat.
- [ ] Chats marked as TEST are excluded.

## Graph criterias:
- [ ] Graph does not show empty values such as "-" or such. Note! The number 0 is not an empty value in most cases unless specified!
- [ ] Graph counters scale as the values grow. Scale is rounded up to the tenth number (In case of 1 then 10 is shown, 49 shows 50, 132 shows 140 etc)
- [ ] If no data is present, the time period on the graph is still displayed as selected.
- [ ] The graph displays the start date on the left side of the graph.
- [ ] The graph displays the end date on the right side of the graph.
