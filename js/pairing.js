(function(root, factory){
    if (typeof module !== 'undefined' && module.exports) module.exports = factory();
    else root.generatePairs = factory();
})(this, function(){
    // Backtracking pairing algorithm with exclusion support.
    // names: array of strings (givers)
    // exclusions: array of { giver: string, receiver: string }
    function generatePairs(names, exclusions){
        if (!Array.isArray(names)) throw new Error('names must be an array');
        exclusions = exclusions || [];

        // Build exclusion map: giver -> Set of receivers they cannot get
        const exclusionMap = new Map();
        exclusions.forEach(ex => {
            if (!ex || !ex.giver || !ex.receiver) return;
            const key = ex.giver;
            if (!exclusionMap.has(key)) exclusionMap.set(key, new Set());
            exclusionMap.get(key).add(ex.receiver);
        });

        // For each giver, compute allowed receivers (exclude self & explicit exclusions)
        const allowed = new Map();
        names.forEach(giver => {
            const disallowed = exclusionMap.get(giver) || new Set();
            const arr = names.filter(r => r !== giver && !disallowed.has(r));
            if (arr.length === 0) {
                throw new Error(`No possible receivers for ${giver}. Check exclusions or add more participants.`);
            }
            allowed.set(giver, arr.slice()); // copy
        });

        // Order givers by fewest options first (heuristic)
        const givers = Array.from(names).sort((a,b) => allowed.get(a).length - allowed.get(b).length);

        const assignment = new Map();
        const used = new Set();

        // Shuffle utility to randomize tie-breaking
        function shuffle(array){
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function backtrack(index){
            if (index >= givers.length) return true; // all assigned
            const giver = givers[index];
            // try receivers in order - shuffle to avoid same pattern every run
            const options = shuffle(allowed.get(giver).slice());
            for (let i = 0; i < options.length; i++){
                const receiver = options[i];
                if (used.has(receiver)) continue;
                // assign
                assignment.set(giver, receiver);
                used.add(receiver);
                if (backtrack(index + 1)) return true;
                // backtrack
                assignment.delete(giver);
                used.delete(receiver);
            }
            return false;
        }

        const possible = backtrack(0);
        if (!possible) throw new Error('Could not find a valid matching. Try removing some exclusions or add more participants.');

        return Array.from(names).map(giver => ({ giver, receiver: assignment.get(giver) }));
    }

    return generatePairs;
});
