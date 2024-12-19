# j

j do what I say

## stack

typescript + gpt + your terminal = magic

## install

```bash
# npm
npm install -g @0xc00010ff/j

# or clone & build
git clone https://github.com/0xc00010ff/j.git
cd j
npm install
npm run build
npm link
```

## examples

```bash
j make a new next project
npx create-next-app@latest my-next-project

j list abc*
ls -d abc\*

j show memory hogs
ps aux | sort -rk 4 | head -n 10
```

## api key

```bash
# set
j -k your-openai-key

# remove
j -k
```

PRs welcome. break things.
