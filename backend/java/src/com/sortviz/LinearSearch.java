package com.sortviz;
import java.util.List;

public class LinearSearch {
    public static void run(int[] a, Integer target, List<String> steps) {
        if (target == null) throw new IllegalArgumentException("target required");
        steps.add(SortRunner.frame("Linear Search " + target, a, new int[0][], true, false));
        for (int i = 0; i < a.length; i++) {
            int[][] marks = new int[i + 1][2];
            for (int k = 0; k < i; k++) marks[k] = new int[]{k, 7};
            marks[i] = new int[]{i, 1};
            steps.add(SortRunner.frame("Check " + i, a, marks, true, false));
            if (a[i] == target) {
                steps.add(SortRunner.frame("Found at " + i, a, new int[][]{{i,4}}, false, true));
                return;
            }
        }
        int[][] all = new int[a.length][2];
        for (int i = 0; i < a.length; i++) all[i] = new int[]{i, 7};
        steps.add(SortRunner.frame("Not found", a, all, false, false));
    }
}
