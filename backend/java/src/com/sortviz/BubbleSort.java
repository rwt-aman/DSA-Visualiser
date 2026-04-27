package com.sortviz;
import java.util.List;

public class BubbleSort {
    public static void run(int[] a, List<String> steps) {
        steps.add(SortRunner.frame("Initial", a, new int[0][], true, false));
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                int[][] marks = new int[i + 2][2];
                for (int k = 0; k < i; k++) marks[k] = new int[]{n - 1 - k, 6}; // sorted
                marks[i] = new int[]{j, 1}; // compare
                marks[i + 1] = new int[]{j + 1, 1}; // compare
                steps.add(SortRunner.frame("Compare", a, marks, true, false));
                
                if (a[j] > a[j + 1]) {
                    int tmp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = tmp;
                    
                    marks = new int[i + 2][2];
                    for (int k = 0; k < i; k++) marks[k] = new int[]{n - 1 - k, 6}; // sorted
                    marks[i] = new int[]{j, 2}; // swap
                    marks[i + 1] = new int[]{j + 1, 2}; // swap
                    steps.add(SortRunner.frame("Swap", a, marks, true, false));
                }
            }
            int[][] marks = new int[i + 1][2];
            for (int k = 0; k <= i; k++) marks[k] = new int[]{n - 1 - k, 6}; // sorted
            steps.add(SortRunner.frame("Locked in place", a, marks, true, false));
        }
        int[][] all = new int[n][2];
        for (int i = 0; i < n; i++) all[i] = new int[]{i, 6};
        steps.add(SortRunner.frame("Sorted", a, all, false, true));
    }
}
