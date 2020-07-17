export class DisjointSets {
    private sets : Array<number>;
    private num_of_elements : number;

    constructor(num_of_elements : number) {
        this.sets = new Array<number>();

        for (let i = 0; i < num_of_elements; i++) {
            this.sets.push(-1);
        }

        this.num_of_elements = num_of_elements;
    }

    find(index : number) : number {
        if (index >= this.sets.length)
            return -1;

        if (this.sets[index] < 0) {
            return index;
        }
        else {
            return this.sets[index] = this.find(this.sets[index]);
        }
    }

    performUnion(set_index_one : number, set_index_two : number) : void {
        if (set_index_one >= this.sets.length || set_index_two >= this.sets.length) {
            return;
        }

        //Find the roots.
        let root1 = this.find(set_index_one);
        let root2 = this.find(set_index_two);

        if (this.sets[root2] < this.sets[root1]) {
            //Root 2 is deeper
            this.sets[root1] = root2;
        }
        else {
            //Update height if same
            if (this.sets[root1] == this.sets[root2]) {
                this.sets[root1]--;
            }

            this.sets[root2] = root1;
        }

        this.num_of_elements--;
    }

    getSize() : number {
        return this.num_of_elements;
    }
}