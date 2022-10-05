# update userscripts (private dev) & safari-userscripts (release) Github's
# eg:  ./git.sh "commit message"
# equivalent to (git add -A .) + (git commit -m arg1) + (git push)     THEN    ./build.sh arg1


# check for commit message
# if [ $# -eq 0 ]; then
#    echo "no commit message supplied"
#    exit -1
# fi

# git add -A .
# git commit -m "$1" # argument
# git push origin main

./build.sh $1