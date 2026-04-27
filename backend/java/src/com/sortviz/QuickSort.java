package com.sortviz;
import java.util.List;

public class QuickSort {
    public static void run(int[] a, List<String> steps) {
        steps.add(SortRunner.frame("Initial", a, new int[0][], true, false));
        qs(a, 0, a.length - 1, steps);
        int[][] all = new int[a.length][2];
        for (int i = 0; i < a.length; i++) all[i] = new int[]{i, 6};
        steps.add(SortRunner.frame("Sorted", a, all, false, true));
    }
    static void qs(int[] a, int lo, int hi, List<String> steps) {
        if (lo >= hi) return;
        int pivot = a[hi], i = lo;
        steps.add(SortRunner.frame("Partition pivot=" + pivot, a, new int[][]{{hi,3}}, true, false));
        for (int j = lo; j < hi; j++) {
            steps.add(SortRunner.frame("Compare", a, new int[][]{{j,1},{hi,3}}, true, false));
            if (a[j] < pivot) {
                int t = a[i]; a[i] = a[j]; a[j] = t;
                steps.add(SortRunner.frame("Swap", a, new int[][]{{i,2},{j,2},{hi,3}}, true, false));
                i++;
            }
        }
        int t = a[i]; a[i] = a[hi]; a[hi] = t;
        steps.add(SortRunner.frame("Pivot placed", a, new int[][]{{i,6}}, true, false));
        qs(a, lo, i - 1, steps);
        qs(a, i + 1, hi, steps);
    }
}
