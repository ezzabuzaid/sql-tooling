#!/usr/bin/env node
import { Format, preCommit } from '@zukhruf/git-hooks';

await preCommit([new Format()]);
