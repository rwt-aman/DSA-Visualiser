package com.sortviz;
import java.util.Arrays;
import java.util.List;

public class JumpSearch {
    public static void run(int[] a, Integer target, List<String> steps) {
        if (target == null) throw new IllegalArgumentException("target required");
        Arrays.sort(a);
        
        int[][] allSorted = new int[a.length][2];
        for (int i = 0; i < a.length; i++) allSorted[i] = new int[]{i, 6};
        steps.add(SortRunner.frame("Sorted (required for Jump Search)", a, allSorted, true, false));
        
        int n = a.length;
        int step = (int) Math.floor(Math.sqrt(n));
        int prev = 0;
        
        while (a[Math.min(step, n) - 1] < target) {
            int[][] marks = new int[prev + 2][2];
            for (int k = 0; k < prev; k++) marks[k] = new int[]{k, 7}; // dim
            marks[prev] = new int[]{prev, 5}; // in-range
            marks[prev + 1] = new int[]{Math.min(step, n) - 1, 1}; // compare
            steps.add(SortRunner.frame("Jump step " + step, a, marks, true, false));
            
            prev = step;
            step += (int) Math.floor(Math.sqrt(n));
            if (prev >= n) {
                int[][] dimAll = new int[n][2];
                for (int i = 0; i < n; i++) dimAll[i] = new int[]{i, 7};
                steps.add(SortRunner.frame("Not found", a, dimAll, false, false));
                return;
            }
        }
        
        int blocks = Math.min(step, n) - prev;
        int[][] blockMarks = new int[prev + blocks][2];
        for (int k = 0; k < prev; k++) blockMarks[k] = new int[]{k, 7};
        for (int k = 0; k < blocks; k++) blockMarks[prev + k] = new int[]{prev + k, 5};
        steps.add(SortRunner.frame("Block found [" + prev + ".." + (Math.min(step, n) - 1) + "]", a, blockMarks, true, false));
        
        while (a[prev] < target) {
            int[][] searchMarks = new int[prev + blocks + 1][2]; // rough size
            int idx = 0;
            for (int k = 0; k < prev; k++) searchMarks[idx++] = new int[]{k, 7};
            for (int k = prev; k < Math.min(step, n); k++) searchMarks[idx++] = new int[]{k, 5};
            searchMarks[idx++] = new int[]{prev, 1}; // compare
            
            int[][] exactMarks = new int[idx][2];
            System.arraycopy(searchMarks, 0, exactMarks, 0, idx);
            
            steps.add(SortRunner.frame("Linear search from " + prev, a, exactMarks, true, false));
            prev++;
            if (prev == Math.min(step, n)) {
                int[][] dimAll = new int[n][2];
                for (int i = 0; i < n; i++) dimAll[i] = new int[]{i, 7};
                steps.add(SortRunner.frame("Not found", a, dimAll, false, false));
                return;
            }
        }
        
        int[][] finalMarks = new int[prev + (Math.min(step, n) - prev) + 1][2];
        int idx = 0;
        for (int k = 0; k < prev; k++) finalMarks[idx++] = new int[]{k, 7};
        for (int k = prev; k < Math.min(step, n); k++) finalMarks[idx++] = new int[]{k, 5};
        finalMarks[idx++] = new int[]{prev, 1}; // compare
        int[][] exactMarks = new int[idx][2];
        System.arraycopy(finalMarks, 0, exactMarks, 0, idx);
        
        steps.add(SortRunner.frame("Check " + prev, a, exactMarks, true, false));
        
        if (a[prev] == target) {
            steps.add(SortRunner.frame("Found at " + prev, a, new int[][]{{prev, 4}}, false, true));
            return;
        }
        
        int[][] dimAll = new int[n][2];
        for (int i = 0; i < n; i++) dimAll[i] = new int[]{i, 7};
        steps.add(SortRunner.frame("Not found", a, dimAll, false, false));
    }
}
