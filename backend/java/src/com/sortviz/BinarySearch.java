package com.sortviz;
import java.util.Arrays;
import java.util.List;

public class BinarySearch {
    public static void run(int[] a, Integer target, List<String> steps) {
        if (target == null) throw new IllegalArgumentException("target required");
        Arrays.sort(a);
        int[][] all = new int[a.length][2];
        for (int i = 0; i < a.length; i++) all[i] = new int[]{i, 6};
        steps.add(SortRunner.frame("Sorted (auto)", a, all, true, false));
        int lo = 0, hi = a.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            int[][] marks = new int[a.length][2];
            for (int i = 0; i < a.length; i++) {
                if (i < lo || i > hi) marks[i] = new int[]{i, 7};
                else marks[i] = new int[]{i, 5};
            }
            marks[mid] = new int[]{mid, 1};
            steps.add(SortRunner.frame("lo=" + lo + " mid=" + mid + " hi=" + hi, a, marks, true, false));
            if (a[mid] == target) {
                steps.add(SortRunner.frame("Found at " + mid, a, new int[][]{{mid,4}}, false, true));
                return;
            }
            if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
        }
        int[][] dim = new int[a.length][2];
        for (int i = 0; i < a.length; i++) dim[i] = new int[]{i, 7};
        steps.add(SortRunner.frame("Not found", a, dim, false, false));
    }
}
