package com.sortviz;
import java.util.List;

public class MergeSort {
    public static void run(int[] a, List<String> steps) {
        steps.add(SortRunner.frame("Initial", a, new int[0][], true, false));
        sort(a, 0, a.length - 1, steps);
        int[][] all = new int[a.length][2];
        for (int i = 0; i < a.length; i++) all[i] = new int[]{i, 6};
        steps.add(SortRunner.frame("Sorted", a, all, false, true));
    }
    static void sort(int[] a, int lo, int hi, List<String> steps) {
        if (lo >= hi) return;
        int mid = (lo + hi) >>> 1;
        sort(a, lo, mid, steps);
        sort(a, mid + 1, hi, steps);
        merge(a, lo, mid, hi, steps);
    }
    static void merge(int[] a, int lo, int mid, int hi, List<String> steps) {
        int[] tmp = new int[hi - lo + 1];
        int i = lo, j = mid + 1, k = 0;
        while (i <= mid && j <= hi) {
            steps.add(SortRunner.frame("Merge [" + lo + ".." + hi + "]", a,
                new int[][]{{i,1},{j,1}}, true, false));
            if (a[i] <= a[j]) tmp[k++] = a[i++]; else tmp[k++] = a[j++];
        }
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi)  tmp[k++] = a[j++];
        for (int t = 0; t < tmp.length; t++) a[lo + t] = tmp[t];
        int[][] marks = new int[tmp.length][2];
        for (int t = 0; t < tmp.length; t++) marks[t] = new int[]{lo + t, 6};
        steps.add(SortRunner.frame("Merged [" + lo + ".." + hi + "]", a, marks, false, true));
    }
}
